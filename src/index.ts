import 'dotenv/config';
import './typings/types';
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from './lib/db';
import fs from 'fs';
import path from 'path';
import { Endpoint } from './typings/types';

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.enable('trust proxy');
app.disable('x-powered-by');

app.use('/site/files', express.static('static'));

app.use(async (req, res, next) => {
    if (req.headers.authorization) {
        try {
            let jwtuser = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
            let user = await prisma.user.findUnique({
                where: { id: (jwtuser as any).userid }
            })
            req.user = user || undefined;
        }
        catch { }
    }
    next();
});

const endpointMap = new Map<string, string[]>();
const endpoints = fs.readdirSync(path.join(process.cwd(), 'src', 'endpoints'));

for (const file of endpoints) {
    const endpoint: Endpoint = require(path.join(process.cwd(), 'src', 'endpoints', file));
    if (!endpoint.name || !endpoint.method || !endpoint.execute) {
        console.error(`Invalid endpoint ${file}`);
    }
    else if (endpointMap.has(endpoint.name) && endpointMap.get(endpoint.name)!.includes(endpoint.method)) {
        console.error(`Duplicate endpoint ${file} (${endpoint.method.toUpperCase()} ${endpoint.name})`);
    }
    else {
        app[endpoint.method](endpoint.name, async (req, res, next) => {
            if (!endpoint.verify || endpoint.verify(req)) {
                try {
                    return await endpoint.execute(req, res, next);
                }
                catch (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
            }
            else {
                return res.status(403).json({ error: "Forbidden" });
            }
        });
        console.log(`Loaded endpoint: ${endpoint.method.toUpperCase()} ${endpoint.name} (${file})`);
    }
}

const frontendpath = path.isAbsolute(process.env.FRONTEND_DIST_PATH) ? process.env.FRONTEND_DIST_PATH : path.join(__dirname, process.env.FRONTEND_DIST_PATH);

app.use(express.static(frontendpath, { extensions: ['html'] }));

app.use('/', function (req, res) {
    res.sendFile(path.join(frontendpath, `index.html`));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
