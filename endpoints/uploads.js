const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const contentdisp = require('content-disposition');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

module.exports.name = "/uploads/*";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res, next) {
    if (req.query.fileid) {
        //check perms and decided whether to send file or not
        prisma.file.findUnique({
            where: {
                id: req.query.fileid
            },
            include: {
                upload: true
            }
        }).then(file => {
            if (file && (!file.upload || file.upload.completed) && !file.deleted) {
                if (file.type == "private") {
                    try {
                        let user = jwt.verify(req.headers.authorization, config.secrets.jwt);
                        if (file.userid === user.userid) {
                            sendFile(res, next, file);
                        }
                        else {
                            next();
                        }
                    }
                    catch {
                        next();
                    }
                }
                else {
                    sendFile(res, next, file);
                }
            }
            else {
                next();
            }
        }).catch(err => next());
    }
    else {
        next();
    }
}

function sendFile(res, next, file) {
    let filepath = path.join(__dirname, `../uploads/${file.id}/${file.name}`);
    if (fs.existsSync(filepath)) {
        res.setHeader('Content-Disposition', contentdisp(filepath));
        res.sendFile(filepath);
    }
    else {
        next();
    }
}
