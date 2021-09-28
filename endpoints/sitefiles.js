const fs = require('fs');
const path = require('path');
const config = require('../config');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/site/files";
module.exports.execute = function(req, res) {
    if (fs.existsSync(`./data/files${req.url}`)) {
        res.sendFile(path.join(process.cwd() + `/data/files${req.url}`));
    }
    else {
        res.status(404).sendFile(path.join(process.cwd() + `/pages/404.html`));
    }
}