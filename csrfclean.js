//this script is a standalone script that cleans up unused csrf tokens
//you should use this as a cronjob

const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        res.send('Error occurred').end();
        return;
    }
});
db.run(`DELETE FROM csrf WHERE generated < ?`, [Date.now() - 10800000], (err) => {
    db.close((err) => { });
    if (err) {
        console.log(err);
    }
})