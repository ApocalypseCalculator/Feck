const cluster = require('cluster');
const config = require('./config');

if (cluster.isPrimary) {
    const cpucount = require('os').cpus().length;
    const tasks = require('./tasks');

    for (let i = 0; i < Math.min(cpucount, Math.max(config.workers, 1)); i++) {
        let worker = cluster.fork();
        worker.on("online", () => {
            console.log(`Worker: ${worker.process.pid} (#${i}) is online`);
        });
        worker.on("exit", () => {
            console.log(`Worker: ${worker.process.pid} (#${i}) has exited`);
        })
    }
    setInterval(() => {
        tasks.cleanCSRF();
    }, 1 * 60 * 60 * 1000) //1 hour
}
else if (cluster.isWorker) {
    const express = require("express");
    const cookieparser = require('cookie-parser');
    const rateLimit = require("express-rate-limit");
    const fs = require('fs');
    const path = require('path');

    const app = express();
    const PORT = 8080;
    const limiter = rateLimit({
        windowMs: config.ratelimit.time * 1000 * 60,
        max: config.ratelimit.requests
    });

    app.use(limiter);
    app.use(cookieparser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json({ strict: true }));
    app.enable('trust proxy');

    app.use('/site/files', express.static('static'));

    var endpoints = {};
    fs.readdirSync("./endpoints/").forEach(function (file) {
        let m = require("./endpoints/" + file);
        if (m.name == null || m.execute == null || m.method == null) {
            console.error(`\x1b[31mInvalid endpoint: ${file}\x1b[0m`);
        } else if (m.name in endpoints && endpoints[m.name] == m.method) {
            console.error(
                `\x1b[31mDuplicate endpoint: ${file} (${m.method} ${m.name})\x1b[0m`
            );
        } else {
            endpoints[m.name] = m.method;
            app[m.method.toLowerCase()](m.name, (req, res, next) => {
                if (m.verify(req, res, next)) {
                    try {
                        m.execute(req, res, next);
                    }
                    catch {
                        res.status(500).json({ status: 500, error: 'Internal server error' });
                    }
                }
                else {
                    res.status(403).json({ status: 403, error: 'Access denied' });
                }
            });
            //console.log(`Loaded endpoint: ${m.method} ${file} (${m.name})`);
        }
    });

    app.use(express.static('./client/dist', { extensions: ["html"] }));

    app.use('/', function (req, res) {
        res.sendFile(path.join(__dirname + `/client/dist/index.html`));
    })

    app.listen(PORT, () => {
        console.log(`Worker (PID ${cluster.worker.process.pid}) listening on port ${PORT}`);
    });
}
else {
    console.log("Unrecognized cluster instance");
}
