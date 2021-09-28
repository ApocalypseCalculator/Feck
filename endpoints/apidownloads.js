const fs = require('fs');
const config = require('../config');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/api/downloads";
module.exports.execute = function (req, res) {
    if (config.database.sqlite) {
        let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
                res.send('Error occurred').end();
                return;
            }
        });
        db.all(`SELECT * FROM files ORDER BY date DESC`, function (err, rows) {
            db.close((err) => { });
            if (err) {
                res.sendStatus(500).end();
            }
            else {
                let raw = JSON.stringify(rows);
                res.send(raw).end();
            }
        });
    }
    else {
        let raw = fs.readFileSync('./data/data.json');
        let parsed = JSON.parse(raw);
        let files = parsed.files;
        files.reverse();
        let newraw = JSON.stringify(files);
        res.send(newraw).end();
    }
}
