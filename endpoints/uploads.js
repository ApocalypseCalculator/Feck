const path = require('path');
const config = require('../config');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/uploads";
module.exports.execute = function(req, res) {
    let link = decodeURIComponent(req.url);
    if (fs.existsSync(`./uploads${link}`)) {
        res.sendFile(path.join(process.cwd() + `/uploads${link}`));
    }
    else {
        res.status(404).sendFile(path.join(process.cwd() + `/pages/404.html`));
    }
}