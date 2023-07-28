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

module.exports.name = "/api/upload/transport/:transportId";
module.exports.method = "DELETE";
module.exports.verify = function (req, res) {
    return true;
}

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
                else {
                    let filepath = path.join(__dirname, `../uploads/${upload.fileid}/` + upload.file.name);
                    prisma.upload.update({
                        where: {
                            transportId: req.params.transportId
                        },
                        data: {
                            completed: true,
                            file: {
                                update: {
                                    deleted: true
                                }
                            }
                        }
                    }).then(() => {
                        res.set('Cache-Control', 'no-store');
                        res.status(204).send();
                        if (!fs.existsSync(filepath)) {
                            fs.rm(filepath);
                        }
                    })
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
