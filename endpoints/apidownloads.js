const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('../config');
const jwt = require('jsonwebtoken');

module.exports.name = "/api/downloads";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let user = null;
    try {
        user = jwt.verify(req.headers.authorization, config.secrets.jwt);
    }
    catch { }
    if (req.query.fileid) {
        prisma.file.findFirst({
            where: {
                id: req.query.fileid,
                deleted: false
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        }).then(file => {
            if(!file) {
                res.status(404).json({error: "File not found"});
            }
            else if(file.type === "private") {
                if(user && file.userid === user.userid) {
                    let sfile = file;
                    delete sfile.deleted;
                    res.json(sfile);
                }
                else {
                    res.status(404).json({error: "File not found"});
                }
            }
            else {
                res.json(file);
            }
        })
    }
    else {
        prisma.file.findMany({
            where: {
                AND: [
                    {
                        deleted: false
                    },
                    {
                        OR: [
                            {
                                type: "public",
                            },
                            {
                                AND: {
                                    userid: user ? user.userid : "-1",
                                }
                            }
                        ]
                    }
                ],
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        }).then(data => {
            let filtered = data.map(e => {
                delete e.deleted;
                return e;
            })
            res.json(filtered);
        })
    }
}