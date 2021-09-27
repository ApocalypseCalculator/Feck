const express = require("express");
const cookieparser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const Busboy = require('busboy');
const fs = require('fs');
const nanoid = require('nanoid');
const path = require('path');
const config = require('./config');
const notif = require('./notif');
const package = require('./package.json');
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

app.post('/api/downloads', function (req, res) {
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
})

app.use('/uploads', function (req, res) {
    let link = decodeURIComponent(req.url);
    if (fs.existsSync(`./uploads${link}`)) {
        res.sendFile(path.join(__dirname + `/uploads${link}`));
    }
    else {
        res.status(404).sendFile(path.join(__dirname + `/pages/404.html`));
    }
});

app.use('/site/files', function (req, res) {
    if (fs.existsSync(`./data/files${req.url}`)) {
        res.sendFile(path.join(__dirname + `/data/files${req.url}`));
    }
})

app.use('/home', function (req, res) {
    res.send(fs.readFileSync('./templates/home.html').toString().replace('[name]', config.name).replace('[version]', package.version).replace('<a href="mailto:"></a>', `<a href="mailto:${config.email}">${config.email}</a>`));
})

app.use('/', function (req, res) {
    if (fs.existsSync(`./pages${req.url.split('?')[0]}.html`)) {
        res.sendFile(path.join(__dirname + `/pages${req.url.split('?')[0]}.html`));
    }
    else {
        if (req.url === '/') {
            res.redirect('/home');
        } else {
            res.status(404).sendFile(path.join(__dirname + `/pages/404.html`));
        }
    }
})

function getIndex(arr, prop, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][prop] === val) {
            return i;
        }
    }
    return -1;
}

function formatSize(number) {
    if (number >= 1024 * 1024) {
        let mbSize = parseInt(number / (1024 * 1024));
        return `${mbSize}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "MB";
    }
    else if (number >= 1024) {
        let kbSize = parseInt(number / (1024));
        return `${kbSize}KB`;
    }
    else {
        return `${number}B`;
    }
}