const express = require("express");
const cookieparser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const fs = require('fs');
const config = require('./config');
const tools = require('./tools');

var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}


const app = express();
const limiter = rateLimit({
    windowMs: config.ratelimit.time * 1000 * 60,
    max: config.ratelimit.requests
});

app.use(limiter);
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ strict: true }));
app.enable('trust proxy');

const PORT = 8080;
tools.configChecks().then(() => {
    setTimeout(function () { //shrug
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }, 100);
})

fs.readdirSync('./endpoints/').forEach(function (file) {
    let m = require('./endpoints/' + file);
    if (m.name == null || m.execute == null) {
        console.error(`\x1b[31mInvalid endpoint: ${file}\x1b[0m`);
    }
    else {
        app.use(`${m.name}`, m.execute);
        console.log(`Loaded endpoint: ${file} (${m.name})`);
    }
});