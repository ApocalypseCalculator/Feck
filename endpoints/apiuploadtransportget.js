const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const config = require('../config');

module.exports.name = "/api/upload/transport/:transportId";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
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
                res.json({
                    transportid: upload.transportId,
                    fileid: upload.fileid,
                    offset: upload.offset,
                    totalsize: upload.file.size,
                    created: upload.created
                });
            }
        }
        else {
            res.status(404).json({ status: 404, error: 'Transport not found' });
        }
    }).catch((err) => {
        res.status(500).json({ status: 500, error: "Internal server error" });
    });
}
