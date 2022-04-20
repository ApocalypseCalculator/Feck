const config = require('../config');
const package = require('../package.json');
const fs = require('fs');

module.exports.name = "/home";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.send(fs.readFileSync('./templates/home.html').toString().replace('[name]', config.name).replace('[version]', package.version).replace('<a href="mailto:"></a>', `<a href="mailto:${config.email}">${config.email}</a>`));
}