const fs = require('fs');
const config = require('../config');
const package = require('../package.json');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/home";
module.exports.execute = function(req, res) {
    res.send(fs.readFileSync('./templates/home.html').toString().replace('[name]', config.name).replace('[version]', package.version).replace('<a href="mailto:"></a>', `<a href="mailto:${config.email}">${config.email}</a>`));
}