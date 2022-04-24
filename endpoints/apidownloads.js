const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('../config');
const jwt = require('jsonwebtoken');

module.exports.name = "/api/downloads";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    let user = null;
    try {
        user = jwt.verify(req.headers.authorization, config.secrets.jwt);
    }
    catch { }
    prisma.file.findMany({
        where: {
            AND: [
                {
                    deleted: false
                },
                {
                    OR: [
                        {
                            type: "public",
                        },
                        {
                            AND: {
                                userid: user ? user.userid : "-1",
                            }
                        }
                    ]
                }
            ],
        },
        include: {
            user: {
                select: {
                    username: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    }).then(data => {
        let raw = JSON.stringify(data);
        res.send(raw).end();
    })
}