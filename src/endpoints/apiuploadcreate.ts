import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import { customAlphabet, nanoid } from "nanoid";

const TUS_VERSION = "1.0.0";

interface UploadMetadata {
    filename: string;
    type: 'public' | 'private' | 'unlisted';
}

export = {
    name: "/api/upload/create",
    method: "post",
    execute: async (req, res, _) => {
        res.setHeader('Tus-Resumable', TUS_VERSION);
        if (!req.headers["tus-resumable"] || req.headers["tus-resumable"] != TUS_VERSION) {
            return res.status(412).json({ error: `Invalid or unsupported tus version` });
        }
        if (req.headers["upload-defer-length"]) {
            return res.status(400).json({ error: `Upload-Defer-Length not supported` });
        }
        if (!req.headers['upload-length']) {
            return res.status(400).json({ error: 'Missing Upload-Length header' });
        }
        if (!req.headers["base64-meta"]) {
            return res.status(400).json({ error: 'Missing Base64-Meta header' });
        }
        let size = parseInt(req.headers['upload-length'] as string);
        let limit = parseInt((req.user ? process.env.MAX_UPLOAD_SIZE_MB : process.env.MAX_UPLOAD_SIZE_GUEST_MB) || "0") * 1024 * 1024;
        if (
            isNaN(size) || size <= 0 ||
            size > limit
        ) {
            res.set('Tus-Max-Size', `${limit}`); //reply with file limit
            return res.status(413).json({ error: `You have exceeded the maximum allowed size for your current session` });
        }

        let metadata: UploadMetadata;
        try {
            metadata = JSON.parse(Buffer.from(req.headers["base64-meta"] as string, 'base64').toString('utf-8'));
        }
        catch {
            return res.status(400).json({ status: 400, error: 'Invalid Base64-Meta header' });
        }

        if (metadata.type === 'private' && !req.user) {
            return res.status(401).json({ error: "Authentication required for private uploads" });
        }

        let fileid = nanoid();
        let filename = (metadata.filename || "unknown").replace(/\s+/g, '-');
        let sanitizedname = /^[\w\.\-]{1,100}$/.test(filename) ? filename : "unknown";
        let file = await prisma.file.create({
            data: {
                id: fileid,
                name: sanitizedname,
                date: Date.now(),
                size: size,
                type: metadata.type,
                userid: req.user ? req.user.id : null
            }
        });

        let tusid = customAlphabet('1234567890abcdef', 24)();
        await prisma.upload.create({
            data: {
                transportId: tusid,
                fileid: file.id,
                created: Date.now()
            }
        });
        res.set('Upload-Expires', new Date(Date.now() + (7 * 86400000 /* 1 day */)).toUTCString());
        res.set('Location', `/api/upload/transport/${tusid}`);
        return res.status(201).json(
            { message: 'Successfully created upload endpoint', transportId: tusid, fileid: file.id }
        );
    }
} as Endpoint;