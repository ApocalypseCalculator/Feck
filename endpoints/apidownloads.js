const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.name = "/api/downloads";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    prisma.file.findMany({
        orderBy: {
            date: 'desc'
        }
    }).then(data => {
        let raw = JSON.stringify(data);
        res.send(raw).end();
    })
}