const path = require('path');
const fs = require('fs');
const notif = require('../notif');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const config = require('../config');

module.exports.name = "/api/upload/transport/:transportId";
module.exports.method = "PATCH";
module.exports.verify = function (req, res) {
    return true;
}

// TODO: add proper handling for network errors etc

module.exports.execute = function (req, res) {
    res.set('Tus-Resumable', '1.0.0'); //hardcoding tus version :pepega:
    if (req.headers["tus-resumable"] && req.headers["tus-resumable"] == "1.0.0") {
        prisma.upload.findUnique({
            where: {
                transportId: req.params.transportId
            },
            include: {
                file: true
            }
        }).then(upload => {
            if (upload && upload.file) {
                let user = null;
                try {
                    user = jwt.verify(req.headers.authorization, config.secrets.jwt);
                }
                catch { }
                if (upload.completed) {
                    res.status(410).json({ status: 410, error: 'Transport unavailable' });
                }
                else if (Date.now() - upload.created > 7 * 86400000) {
                    res.status(410).json({ status: 410, error: 'Transport expired' });
                }
                else if (upload.file.userid && !user) {
                    res.status(401).json({ status: 401, error: 'Authorization required' });
                }
                else if (upload.file.userid && user.userid !== upload.file.userid) {
                    res.status(403).json({ status: 403, error: 'Access not permitted' });
                }
                else if (req.headers["upload-offset"] !== `${upload.offset}`) { //stringify it to match
                    res.set('Upload-Offset', upload.offset);
                    res.status(409).json({ status: 409, error: 'Conflicting offset' });
                }
                else if (req.headers["content-type"] !== "application/offset+octet-stream") {
                    res.status(415).json({ status: 415, error: 'Must use application/offset+octet-stream' });
                }
                else if (!req.headers["content-length"] || isNaN(parseInt(req.headers["content-length"])) || parseInt(req.headers["content-length"]) <= 0) {
                    res.status(400).json({ status: 400, error: 'Invalid content length' });
                }
                else {
                    let contentlength = parseInt(req.headers["content-length"]);
                    if (contentlength + upload.offset > upload.file.size) {
                        res.status(400).json({ status: 400, error: 'Invalid content length' });
                    }
                    else {
                        let filepath = path.join(__dirname, `../uploads/${upload.fileid}/` + upload.file.name);
                        if (upload.offset == 0) {
                            if (!fs.existsSync(`./uploads/${upload.fileid}`)) {
                                fs.mkdirSync(`./uploads/${upload.fileid}`);
                            }
                            fs.openSync(filepath, 'w');
                        }
                        req.pipe(fs.createWriteStream(filepath, { flags: 'a' }));
                        req.on('end', () => {
                            prisma.upload.update({
                                where: {
                                    transportId: req.params.transportId
                                },
                                data: {
                                    offset: {
                                        increment: contentlength
                                    },
                                    completed: (contentlength + upload.offset == upload.file.size)
                                }
                            }).then(() => {
                                res.set('Cache-Control', 'no-store');
                                res.set('Upload-Offset', upload.offset + contentlength);
                                res.set('Upload-Length', upload.file.size);
                                res.set('Upload-Expires', new Date(Date.now() + (7 * 86400000 /* 1 day */)).toUTCString());
                                res.status(204).send();
                                if (contentlength + upload.offset == upload.file.size) {
                                    notif.sendNotif(upload.file.name, upload.fileid, req.hostname, req.ip, upload.file.size, upload.file.type === "private").catch();
                                }
                            })
                        });
                    }
                }
            }
            else {
                res.status(404).json({ status: 404, error: 'Transport not found' });
            }
        }).catch((err) => {
            res.status(500).json({ status: 500, error: "Internal server error" });
        })
    }
    else {
        res.status(412).json({ status: 412, error: `Invalid or unsupported tus version` });
    }
}
