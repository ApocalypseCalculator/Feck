const express = require("express");
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const rateLimit = require("express-rate-limit");
const Busboy = require('busboy');
const fs = require('fs');
const nanoid = require('nanoid');
const sqlite3 = require('sqlite3');
const path = require('path');
const config = require('./config');
const notif = require('./notif');
const package = require('./package.json');


const app = express();
const limiter = rateLimit({
    windowMs: config.ratelimit.time * 1000 * 60,
    max: config.ratelimit.requests
});

app.use(limiter);
app.use(cookieparser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.enable('trust proxy');

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

app.post('/upload', function (req, res) {
    try {
        if (req.headers.csrftoken) {
            let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                    res.send('Error occurred').end();
                    return;
                }
            });
            db.get(`SELECT * FROM csrf WHERE token = ?`, [req.headers.csrftoken], (err, row) => {
                if (err) {
                    res.sendStatus(500).end();
                }
                else if (!row) {
                    res.send(`I see what you're trying to do and I don't like it`);
                }
                else {
                    db.run(`DELETE FROM csrf WHERE token = ?`, [req.headers.csrftoken], (err) => {
                        if (err) {
                            res.sendStatus(500).end();
                        }
                        else if (Date.now() - row.generated >= 7200000) {
                            res.send(`Your session has expired`);
                        }
                        else {
                            let id = nanoid.nanoid();
                            fs.mkdirSync(`./uploads/${id}`);
                            var busboy = new Busboy({ headers: req.headers });
                            let name = "";
                            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                                var saveTo = path.join(__dirname, `uploads/${id}/` + filename);
                                name = `${filename}`;
                                db.run(`INSERT INTO files(name,id,date) VALUES(?,?,?)`, [filename, id, Date.now()], function (err) {
                                    db.close((err) => { });
                                    if (err) {
                                        console.log(err);
                                        res.sendStatus(500).end();
                                    }
                                })
                                file.pipe(fs.createWriteStream(saveTo));
                            });
                            busboy.on('finish', function () {
                                notif.sendNotif(name, id, fs.statSync(`./uploads/${id}/${name}`).size, req.hostname, req.ip);
                                res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`);
                            });
                            return req.pipe(busboy);
                        }
                    })
                }
            })
        }
        else {
            res.send(`I see what you're trying to do and I don't like it`);
        }
    }
    catch {
        try {
            res.end();
        } catch { }
    };
});

app.post('/api/downloads', function (req, res) {
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
})

app.use('/uploads', function (req, res) {
    let link = decodeURIComponent(req.url);
    if (fs.existsSync(`./uploads${link}`)) {
        res.sendFile(path.join(__dirname + `/uploads${link}`));
    }
    else {
        res.sendStatus(404).end();
    }
});

app.use('/site/files', function (req, res) {
    if (fs.existsSync(`./data/files${req.url}`)) {
        res.sendFile(path.join(__dirname + `/data/files${req.url}`));
    }
})

app.use('/upload', function (req, res) {
    let db = new sqlite3.Database('./data/data.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
            res.send('Error occurred').end();
            return;
        }
    });
    let csrf = nanoid.nanoid(60);
    db.run(`INSERT INTO csrf(token, generated) VALUES(?,?)`, [csrf, Date.now()], (err) => {
        if (err) {
            res.sendStatus(500).end();
        }
        else {
            //yes I know this is very ugly but it will do for now
            res.send(fs.readFileSync('./templates/upload.html').toString().replace('<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="">', `<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="${csrf}">`));
        }
    })
})

app.use('/home', function (req, res) {
    res.send(fs.readFileSync('./templates/home.html').toString().replace('[name]', config.name).replace('[version]', package.version).replace('<a href="mailto:"></a>', `<a href="mailto:${config.email}">${config.email}</a>`));
})

app.use('/', function (req, res) {
    if (fs.existsSync(`./pages${req.url.split('?')[0]}.html`)) {
        res.sendFile(path.join(__dirname + `/pages${req.url.split('?')[0]}.html`));
    }
    else {
        res.redirect('/home');
    }
})