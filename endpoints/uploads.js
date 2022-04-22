const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const contentdisp = require('content-disposition');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports.name = "/uploads/*";
module.exports.method = "GET";
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
                let filepath = path.join(__dirname, `../uploads/${file.id}/${file.name}`);
                if (fs.existsSync(filepath)) {
                    res.setHeader('Content-Disposition', contentdisp(filepath));
                    res.sendFile(filepath);
                }
                else {
                    next();
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
