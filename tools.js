const config = require('./config');

module.exports.configChecks = () => {
    return new Promise((resolve, reject) => {
        console.log('Starting config check...');
        if (typeof config.database.sqlite !== "boolean") {
            console.log("Config database SQLite must be of type boolean");
            process.exit(1);
        }
        else if (typeof config.discord.on !== "boolean") {
            console.log("Config discord on must be of type boolean");
            process.exit(1);
        }
        else if (typeof config.ratelimit.time !== "number") {
            console.log("Config ratelimit time must be of type number");
            process.exit(1);
        }
        else if (typeof config.ratelimit.requests !== "number") {
            console.log("Config ratelimit requests must be of type number");
            process.exit(1);
        }
        else if (config.name === "") {
            console.log("Config name must not be empty");
            process.exit(1);
        }
        else if (config.email === "") {
            console.log("Config email must not be empty");
            process.exit(1);
        }
        else if (config.discord.on && !/^https:\/\/discord.com\/api\/webhooks\/[0-9]{18}\/[0-9a-zA-Z-_]{55,75}$/.test(config.discord.webhook)) {
            console.log("Notification webhook link does not match regex /^https:\\/\\/discord.com\\/api\\/webhooks\\/[0-9]{18}\\/[0-9a-zA-Z-_]{55,75}$/");
            process.exit(1);
        }
        else {
            console.log('Configuration checks passed. Checking database...');
            dbCheck().then(() => {
                resolve();
            })
        }
    })
}

function dbCheck() {
    return new Promise((resolve, reject) => {
        if (config.database.sqlite) {
            let sqlite3 = require('sqlite3');
            let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
            });
            db.get(`SELECT name FROM sqlite_master WHERE type = ? AND name = ?`, ['table', 'files'], (err, row) => {
                if (err) {
                    console.log(err);
                    console.log('Check failed, error occurred. Aborting');
                    process.exit(1);
                }
                else if (!row) {
                    console.log('Check failed, missing files table in database. Aborting');
                    process.exit(1);
                }
                else {
                    db.close((err) => {
                        console.log('Check finished. Running CSRF cleanup script...');
                        try {
                            require('./csrfclean');
                            resolve();
                        }
                        catch {
                            console.log('Error occurred');
                            process.exit(1);
                        }
                    })
                }
            })
        }
        else {
            const fs = require('fs');
            let raw = fs.readFileSync('./data/data.json');
            let parsed = JSON.parse(raw);
            if (parsed.files && parsed.csrf) {
                console.log('Check finished. Running CSRF cleanup script...');
                try {
                    require('./csrfclean');
                    resolve();
                }
                catch {
                    console.log('Error occurred');
                    process.exit(1);
                }
            }
            else {
                console.log('JSON incorrectly formatted');
                process.exit(1);
            }
        }
    })
}