const Busboy = require('busboy');
const fs = require('fs');
const nanoid = require('nanoid');
const path = require('path');
const config = require('../config');
const notif = require('../notif');
var sqlite3;

if (config.database.sqlite) {
    sqlite3 = require('sqlite3');
}

module.exports.name = "/upload";
module.exports.execute = function (req, res) {
    if (req.method === "POST") {
        try {
            if (req.headers.csrftoken) {
                if (config.database.sqlite) {
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
                                    var busboy = new Busboy({ headers: req.headers });
                                    let name = "";
                                    let size = formatSize(req.headers["content-length"]);
                                    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                                        if (filename) {
                                            fs.mkdirSync(`./uploads/${id}`);
                                            var saveTo = path.join(process.cwd(), `uploads/${id}/` + filename);
                                            name = `${filename}`;
                                            db.run(`INSERT INTO files(name,id,date, size) VALUES(?,?,?,?)`, [filename, id, Date.now(), size], function (err) {
                                                db.close((err) => { });
                                                if (err) {
                                                    console.log(err);
                                                    res.sendStatus(500).end();
                                                }
                                            })
                                            file.pipe(fs.createWriteStream(saveTo));
                                        }
                                        else {
                                            res.status(400).send('No file attached?');
                                        }
                                    });
                                    busboy.on('finish', function () {
                                        notif.sendNotif(name, id, req.hostname, req.ip, size).then(() => {
                                            res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`);
                                        }).catch(() => res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`));
                                    });
                                    return req.pipe(busboy);
                                }
                            })
                        }
                    })
                }
                else {
                    let raw = fs.readFileSync('./data/data.json');
                    let parsed = JSON.parse(raw);
                    let indx = getIndex(parsed.csrf, "token", req.headers.csrftoken);
                    if (indx == -1) {
                        res.send(`I see what you're trying to do and I don't like it`);
                    }
                    else if (Date.now() - parsed.csrf[indx].generated >= 7200000) {
                        res.send(`Your session has expired`);
                    }
                    else {
                        let id = nanoid.nanoid();
                        fs.mkdirSync(`./uploads/${id}`);
                        var busboy = new Busboy({ headers: req.headers });
                        let name = "";
                        let size = formatSize(req.headers["content-length"]);
                        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                            if (filename) {
                                var saveTo = path.join(process.cwd(), `uploads/${id}/` + filename);
                                name = `${filename}`;
                                let newobj = {
                                    name: filename,
                                    id: id,
                                    date: Date.now(),
                                    size: size
                                }
                                parsed.files.push(newobj);
                                parsed.csrf.splice(indx, 1);
                                let newraw = JSON.stringify(parsed);
                                fs.writeFileSync('./data/data.json', newraw);
                                file.pipe(fs.createWriteStream(saveTo));
                            }
                            else {
                                res.status(400).send('No file attached?');
                            }
                        });
                        busboy.on('finish', function () {
                            notif.sendNotif(name, id, req.hostname, req.ip, size).then(() => {
                                res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`);
                            }).catch(() => res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`));
                        });
                        return req.pipe(busboy);
                    }
                }
            }
            else {
                res.send(`I see what you're trying to do and I don't like it`);
            }
        }
        catch {
            try {
                res.sendStatus(500).end();
            } catch { }
        };
    }
    else if (req.method === "GET") {
        if (config.database.sqlite) {
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
        }
        else {
            let csrf = nanoid.nanoid(60);
            let raw = fs.readFileSync('./data/data.json');
            let parsed = JSON.parse(raw);
            let newobj = {
                token: csrf,
                generated: Date.now()
            }
            parsed.csrf.push(newobj);
            let newraw = JSON.stringify(parsed);
            fs.writeFileSync('./data/data.json', newraw);
            res.send(fs.readFileSync('./templates/upload.html').toString().replace('<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="">', `<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="${csrf}">`));
        }
    }
}

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