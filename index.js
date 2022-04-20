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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

app.post('/upload', function (req, res) {
    try {
        if (req.headers.csrftoken) {
            prisma.cSRF.findUnique({
                where: {
                    token: req.headers.csrftoken
                }
            }).then(value => {
                if (!value) {
                    res.send("Error occurred");
                }
                else {
                    prisma.cSRF.delete({
                        where: {
                            token: req.headers.csrftoken
                        }
                    }).catch(() => { });
                    if (Date.now() - value.generated >= 7200000) {
                        res.send(`Your session has expired`);
                    }
                    else {
                        let id = nanoid.nanoid();
                        var busboy = Busboy({ headers: req.headers });
                        let name = "";
                        let size = formatSize(req.headers["content-length"]);
                        busboy.on('file', function (anme, file, info) {
                            let { filename, encoding, mimeType } = info;
                            if (filename) {
                                fs.mkdirSync(`./uploads/${id}`);
                                var saveTo = path.join(__dirname, `uploads/${id}/` + filename);
                                name = `${filename}`;
                                prisma.file.create({
                                    data: {
                                        id: id,
                                        name: filename,
                                        date: Date.now(),
                                        size: size
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                });
                                file.pipe(fs.createWriteStream(saveTo));
                            }
                            else {
                                res.status(400).send('No file attached?');
                            }
                        });
                        busboy.on('finish', function () {
                            notif.sendNotif(name, id, req.hostname, req.ip, size).then(() => {
                                res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`).end();
                            }).catch(() => res.send(`/success?filename=${encodeURIComponent(name)}&fileid=${id}`).end());
                        });
                        return req.pipe(busboy);
                    }
                }
            })

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
});

app.post('/api/downloads', function (req, res) {
    prisma.file.findMany({
        orderBy: {
            date: 'desc'
        }
    }).then(data => {
        let raw = JSON.stringify(data);
        res.send(raw).end();
    })
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

app.use('/upload', function (req, res) {
    let csrf = nanoid.nanoid(60);
    prisma.cSRF.create({
        data: {
            token: csrf,
            generated: Date.now()
        }
    }).then(() => {
        res.send(fs.readFileSync('./templates/upload.html').toString().replace('<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="">', `<input class="text" type="hidden" id="csrftoken" name="csrftoken" value="${csrf}">`));
    }).catch(() => res.sendStatus(500).end());
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