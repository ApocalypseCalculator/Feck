//this script is a standalone script that cleans up unused csrf tokens
//you should use this as a cronjob

const config = require('./config');

if (config.database.sqlite) {
    const sqlite3 = require('sqlite3');
    let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
    });
    db.run(`DELETE FROM csrf WHERE generated < ?`, [Date.now() - 10800000], (err) => {
        db.close((err) => { console.log('Done'); return; });
        if (err) {
            console.log(err);
        }
    })
}
else {
    const fs = require('fs');
    let raw = fs.readFileSync('./data/data.json');
    let parsed = JSON.parse(raw);
    let newcsrf = [];
    parsed.csrf.forEach(r => {
        if (r.generated >= Date.now() - 10800000) {
            newcsrf.push(r);
        }
    });
    parsed.csrf = newcsrf;
    let newraw = JSON.stringify(parsed);
    fs.writeFileSync('./data/data.json', newraw);
    console.log('Done');
    return;
}