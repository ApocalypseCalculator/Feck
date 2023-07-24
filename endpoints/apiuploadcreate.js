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

module.exports.name = "/api/upload/create";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.set('Tus-Version', '1.0.0'); //hardcoding tus version :pepega:
    res.set('Tus-Extension', 'creation')
    try {
        if (req.headers["tus-resumable"] && req.headers["tus-resumable"] == "1.0.0") {
            if (!req.headers["upload-defer-length"]) {
                let user = null;
                try {
                    user = jwt.verify(req.headers.authorization, config.secrets.jwt);
                }
                catch { }
                if (!req.headers['upload-length']) {
                    return res.status(400).json({ status: 400, error: 'Missing Upload-Length header' });
                }
                let size = parseInt(req.headers['upload-length']);
                if ((user && size > config.filelimit.registered) || (!user && size > config.filelimit.anon) || size <= 0) {
                    res.set('Tus-Max-Size', user ? config.filelimit.registered : config.filelimit.anon); //reply with file limit
                    res.status(413).json({ status: 413, error: `You have exceeded the maximum allowed size for your current session` });
                }
                else {
                    if (["public", "unlisted", "private"].includes(req.body.type)) {
                        let id = nanoid.nanoid();
                        prisma.file.create({
                            data: {
                                id: id,
                                //name can be a max of 100 chars, name read from filename body and NOT metadata header
                                name: (req.body.filename ?? "unknown").slice(0, 100),
                                date: Date.now(),
                                size: size,
                                type: req.body.type, //public, private, or unlisted
                                userid: user ? user.userid : null
                            }
                        }).then((file) => {
                            let tusid = nanoid.customAlphabet('1234567890abcdef', 24)(); //24 digit hex
                            prisma.upload.create({
                                data: {
                                    transportId: tusid,
                                    fileid: file.id,
                                    created: Date.now()
                                }
                            }).then(() => {
                                res.status(201).set('Location', `/api/upload/transport/${tusid}`).json({status: 201, message: 'Successfully created upload endpoint'});
                            }).catch((err) => {
                                console.log(err);
                            });
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                    else {
                        res.status(400).json({ status: 400, error: 'Missing upload type field' });
                    }
                }
            }
            else {
                res.status(400).json({ status: 400, error: `Upload-Defer-Length not supported` });
            }
        }
        else {
            res.status(412).json({ status: 412, error: `Invalid or unsupported tus version` });
        }
    }
    catch {
        try {
            res.status(500).json({ error: "Internal server error" }).end();
        } catch { }
    };
}
