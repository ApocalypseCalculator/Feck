const fs = require('fs');
const path = require('path');
const config = require('../config');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/";
module.exports.execute = function(req, res) {
    if (fs.existsSync(`./pages${req.url.split('?')[0]}.html`)) {
        res.sendFile(path.join(process.cwd() + `/pages${req.url.split('?')[0]}.html`));
    }
    else {
        if (req.url === '/') {
            res.redirect('/home');
        } else {
            res.status(404).sendFile(path.join(process.cwd() + `/pages/404.html`));
        }
    }
}