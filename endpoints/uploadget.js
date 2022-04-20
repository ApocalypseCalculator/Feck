const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nanoid = require('nanoid');

module.exports.name = "/upload";
module.exports.method = "GET";
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
        res.send(fs.readFileSync('./templates/upload.html').toString().replace('<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="">', `<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="${csrf}">`));
    }).catch(() => res.sendStatus(500).end());
}