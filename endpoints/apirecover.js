const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');
const bcrypt = require('bcrypt');

module.exports.name = "/api/recover";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    if (req.headers.csrftoken) {
        prisma.cSRF.findUnique({
            where: {
                token: req.headers.csrftoken
            }
        }).then(value => {
            if (!value) {
                res.status(401).json({ error: `Invalid CSRF token` });
            }
            else {
                prisma.cSRF.delete({
                    where: {
                        token: req.headers.csrftoken
                    }
                }).catch(() => { });
                if (req.body.username && req.body.password && req.body.recovery) {
                    if (!/^\w+$/.test(req.body.password) || req.body.password.length < 8) {
                        res.status(400).json({ error: `Passwords can only contain alphanumeric characters or underscores and must be at least 8 characters` });
                    }
                    else {
                        prisma.user.findFirst({
                            where: {
                                username: req.body.username
                            }
                        }).then(user => {
                            if (!user) {
                                res.status(401).json({ error: "Username or recovery code incorrect" });
                            }
                            else {
                                bcrypt.compare(req.body.recovery, user.recovery, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.status(401).json({ error: "Internal server error" });
                                    }
                                    else if (!result) {
                                        res.status(401).json({ error: "Username or recovery code incorrect" });
                                    }
                                    else {
                                        bcrypt.hash(req.body.password, 10, function (err3, pwdhash) {
                                            if (err3) {
                                                console.log(err3);
                                                res.status(500).json({ error: `Internal server error` });
                                            }
                                            else {
                                                let recovery = nanoid.nanoid(25);
                                                bcrypt.hash(recovery, 10, function (err2, rechash) {
                                                    if (err2) {
                                                        console.log(err2);
                                                        res.status(500).json({ error: `Internal server error` });
                                                    }
                                                    else {
                                                        prisma.user.update({
                                                            where: {
                                                                id: user.id
                                                            },
                                                            data: {
                                                                password: pwdhash,
                                                                recovery: rechash
                                                            }
                                                        }).then(() => {
                                                            res.json({ recovery: recovery });
                                                        })//.catch(() => res.status(500).json({ error: "Internal server error" }));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        })//.catch(() => res.status(500).json({ error: "Internal server error" }));
                    }
                }
                else {
                    res.status(400).json({ error: `Invalid form` });
                }
            }
        })
    }
    else {
        res.status(400).json({ error: `Error occurred, try reloading` });
    }
}