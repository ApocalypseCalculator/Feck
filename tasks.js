const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.cleanCSRF = () => {
    prisma.cSRF.deleteMany({
        where: {
            generated: {
                lt: Date.now() - 2*7200000 //delete expired CSRF tokens
            }
        }
    })
}
