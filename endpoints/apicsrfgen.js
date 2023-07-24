const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');

module.exports.name = "/api/csrfgen";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let csrf = nanoid.nanoid(60);
    prisma.cSRF.create({
        data: {
            token: csrf,
            generated: Date.now()
        }
    }).then(() => {
        res.json({ csrf: csrf });
    }).catch(() => res.status(500).json({ status: 500, error: 'Internal server error' }));
}