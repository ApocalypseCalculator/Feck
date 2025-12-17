import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import fs from 'fs'; // use fs instead of fs/promises for stream support
import { sendNotif } from "../lib/notif";
import { getFileDir, getFilePath } from "../lib/path";

export = {
    name: "/api/upload/transport/:transportId",
    method: "patch",
    execute: async (req, res, _) => {
        let transport = await prisma.upload.findUnique({
            where: {
                transportId: req.params.transportId
            },
            include: {
                file: true
            }
        });
        if (!transport || !transport.file) {
            return res.status(404).json({ error: 'Transport not found' });
        }
        if (transport.completed) {
            return res.status(410).json({ error: 'Transport unavailable' });
        }
        if (Date.now() - transport.created > 7 * 86400000) {
            return res.status(410).json({ error: 'Transport expired' });
        }
        if (transport.file.userid && !req.user) {
            return res.status(401).json({ error: 'Authorization required' });
        }
        if (transport.file.userid && req.user!.id !== transport.file.userid) {
            return res.status(403).json({ error: 'Access not permitted' });
        }

        if (`${transport.offset}` !== req.headers['upload-offset']) {
            res.set('Upload-Offset', `${transport.offset}`);
            return res.status(409).json({ error: 'Conflicting offset' });
        }
        if (req.headers["content-type"] !== "application/offset+octet-stream") {
            return res.status(415).json({ error: 'Must use application/offset+octet-stream' });
        }
        if (!req.headers["content-length"]) {
            return res.status(400).json({ error: 'Missing content length' });
        }

        let contentlength = parseInt(req.headers["content-length"]);
        if (isNaN(contentlength) || contentlength <= 0 || contentlength + transport.offset > transport.file.size) {
            res.status(400).json({ error: 'Invalid content length' });
        }
        let filepath = getFilePath(transport.file.id, transport.file.name);
        if (transport.offset == 0) {
            let filedir = getFileDir(transport.file.id);
            if (!fs.existsSync(filedir)) {
                fs.mkdirSync(filedir, { recursive: true });
            }
            fs.closeSync(fs.openSync(filepath, 'w'));
        }
        req.pipe(fs.createWriteStream(filepath, { flags: 'a' }));
        await new Promise((resolve, reject) => {
            req.on('end', resolve);
            req.on('error', reject);
        });
        await prisma.upload.update({
            where: {
                transportId: req.params.transportId
            },
            data: {
                offset: {
                    increment: contentlength
                },
                completed: (transport.offset + contentlength == transport.file.size)
            }
        });
        res.set('Cache-Control', 'no-store');
        res.set('Upload-Offset', `${transport.offset + contentlength}`);
        res.set('Upload-Length', `${transport.file.size}`);
        res.set('Upload-Expires', new Date(transport.created + (7 * 86400000 /* 1 day */)).toUTCString());
        if (contentlength + transport.offset == transport.file.size) {
            // note: async
            sendNotif(transport.file.name, transport.fileid, req.hostname, req.ip ?? 'unknown', transport.file.size, transport.file.type === "private").catch();
        }
        return res.status(204).send();
    }
} as Endpoint;