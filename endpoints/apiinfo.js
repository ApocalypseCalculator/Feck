const config = require('../config');
const package = require('../package.json');

module.exports.name = "/api/info";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.status(200).json({
        name: config.name,
        email: config.email,
        version: package.version
    });
}