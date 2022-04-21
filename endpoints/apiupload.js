const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const notif = require('../notif');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');

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
                    if (Date.now() - value.generated >= 7200000) {
                        res.status(401).json({ error: `Your session has expired` });
                    }
                    else {
                        let id = nanoid.nanoid();
                        var busboy = Busboy({ headers: req.headers });
                        let name = "";
                        let size = parseInt(req.headers["content-length"]);
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
                                        size: size
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