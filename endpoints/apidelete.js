const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const contentdisp = require('content-disposition');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

module.exports.name = "/uploads/*";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res, next) {
    if (req.query.fileid) {
        //check perms and decided whether to send file or not
        prisma.file.findFirst({
            where: {
                id: req.query.fileid
            }
        }).then(file => {
            if (file) {
                try {
                    let user = jwt.verify(req.headers.authorization, config.secrets.jwt);
                    if (file.userid === user.userid) {
                        prisma.file.update({
                            where: {
                                id: file.id
                            },
                            data: {
                                deleted: true
                            }
                        });
                        res.json({ message: `Deleted` });
                    }
                    else {
                        res.status(403).json({ error: `Unauthorized` });
                    }
                }
                catch {
                    res.status(401).json({ error: `Unauthorized` });
                }
            }
            else {
                res.status(404).json({ error: `File not found` });
            }
        }).catch(err => res.status(500).json({ error: `Server error` }));
    }
    else {
        res.status(400).json({ error: `Please include file ID to delete` });
    }
}