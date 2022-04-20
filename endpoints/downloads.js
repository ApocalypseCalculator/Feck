const config = require('../config');
const path = require('path')
const fs = require('fs');

module.exports.name = "/downloads";
module.exports.method = "GET";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.sendFile(path.join(__dirname + `/../pages/downloads.html`));
}