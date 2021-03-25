/*
This is a standalone script to sync sqlite3 to json or vice versa
*/

var sqlite3;
const fs = require('fs');

try {
    sqlite3 = require('sqlite3');
}
catch {
    console.log('SQLite not installed. Cannot sync');
}

var args = process.argv.slice(2);
if (args[0] === '--sqlite3') {
    let raw = fs.readFileSync('./data/data.json');
    let parsed = JSON.parse(raw);
    let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
    });
    db.run(`DELETE FROM files`, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        let promises = [];
        for (let i = 0; i < parsed.files.length; i++) {
            promises.push(insert(db, parsed.files[i], i, parsed.files.length));
        }
        Promise.all(promises).then(() => {
            db.close((err) => {
                console.log("Done");
            });
        }).catch(err => console.log(err));
    })
}
else if (args[0] === '--json') {
    let raw = fs.readFileSync('./data/data.json');
    let parsed = JSON.parse(raw);
    let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
    });
    db.all('SELECT * FROM files ORDER BY date DESC', (err, rows) => {
        parsed.files = rows;
        db.close((err) => {
            console.log('Writing to file...');
            let newraw = JSON.stringify(parsed);
            fs.writeFileSync('./data/data.json', newraw);
            console.log('Finished');
            return;
        })
    })
}
else {
    console.log('\nHello, to use my sync function. Use one of the following command line options (I DO NOT sync CSRF tokens, these actions overwrites current data): \n\n--json\t\tTo copy SQLite3 data over to the JSON file\n--sqlite3\tTo copy JSON data over to the SQLite database');
}

function insert(db, e, i, len) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO files (name, id, date) VALUES(?, ?, ?)', [e.name, e.id, e.date], (err) => {
            if (err) {
                reject(err);
            }
            else {
                console.log(`Finished entity ${i + 1} of ${len}`);
                resolve();
            }
        });
    })
}