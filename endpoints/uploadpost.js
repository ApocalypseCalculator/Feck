const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const notif = require('../notif');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');

module.exports.name = "/upload";
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
                    res.send("Error occurred");
                }
                else {
                    prisma.cSRF.delete({
                        where: {
                            token: req.headers.csrftoken
                        }
                    }).catch(() => { });
                    if (Date.now() - value.generated >= 7200000) {
                        res.send(`Your session has expired`);
                    }
                    else {
                        let id = nanoid.nanoid();
                        var busboy = Busboy({ headers: req.headers });
                        let name = "";
                        let size = formatSize(req.headers["content-length"]);
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
                                res.status(400).send('No file attached?');
                            }
                        });
                        busboy.on('finish', function () {
                            notif.sendNotif(name, id, req.hostname, req.ip, size).then(() => {
                                res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`).end();
                            }).catch(() => res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`).end());
                        });
                        return req.pipe(busboy);
                    }
                }
            })

        }
        else {
            res.send(`I see what you're trying to do and I don't like it`);
        }
    }
    catch {
        try {
            res.sendStatus(500).end();
        } catch { }
    };
}

function formatSize(number) {
    if (number >= 1024 * 1024) {
        let mbSize = parseInt(number / (1024 * 1024));
        return `${mbSize}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "MB";
    }
    else if (number >= 1024) {
        let kbSize = parseInt(number / (1024));
        return `${kbSize}KB`;
    }
    else {
        return `${number}B`;
    }
}