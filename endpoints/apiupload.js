const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const notif = require('../notif');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');
const jwt = require("jsonwebtoken");
const disk = require('diskusage');
const config = require('../config');

module.exports.name = "/api/upload";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    try {
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
                    let user = null;
                    try {
                        user = jwt.verify(req.headers.authorization, config.secrets.jwt);
                    }
                    catch { }
                    let type = "public";
                    if (["public", "unlisted", "private"].includes(req.headers.type)) {
                        type = req.headers.type;
                    }
                    let size = parseInt(req.headers["content-length"]);
                    if (Date.now() - value.generated >= 7200000) {
                        res.status(401).json({ error: `Your session has expired` });
                    }
                    else if (type == "private" && !user) {
                        res.status(401).json({ error: `You must be logged in to upload private files` });
                    }
                    else if ((user && size > config.filelimit.registered) || (!user && size > config.filelimit.anon)) {
                        res.status(413).json({ error: `You have exceeded the maximum allowed size for your current session` });
                    }
                    else if (disk.checkSync('./uploads').available - size < config.filelimit.server) {
                        res.status(413).json({ error: "Server out of disk space" });
                    }
                    else {
                        let id = nanoid.nanoid();
                        var busboy = Busboy({ headers: req.headers });
                        let name = "";
                        busboy.on('file', function (anme, file, info) {
                            let { filename, encoding, mimeType } = info;
                            if (filename) {
                                fs.mkdirSync(`./uploads/${id}`);
                                var saveTo = path.join(__dirname, `../uploads/${id}/` + filename);
                                name = `${filename}`;
                                prisma.file.create({
                                    data: {
                                        id: id,
                                        name: filename,
                                        date: Date.now(),
                                        size: size,
                                        type: type, //public, private, or unlisted
                                        userid: user ? user.userid : null
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                });
                                file.pipe(fs.createWriteStream(saveTo));
                            }
                            else {
                                res.status(400).json({ error: 'No file attached?' });
                            }
                        });
                        busboy.on('finish', function () {
                            notif.sendNotif(name, id, req.hostname, req.ip, size).then(() => {
                                res.json({ filename: name, fileid: id }).end();
                            }).catch(() => res.json({ filename: name, fileid: id }).end());
                        });
                        return req.pipe(busboy);
                    }
                }
            })

        }
        else {
            res.status(400).json({ error: `Error occurred, try reloading` });
        }
    }
    catch {
        try {
            res.status(500).json({ error: "Internal server error" }).end();
        } catch { }
    };
}
