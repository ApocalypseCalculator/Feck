import { Endpoint } from "../typings/types";
import prisma from '../lib/db';

export = {
    name: "/api/upload/transport/:transportId",
    method: "head",
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
        res.set('Cache-Control', 'no-store');
        res.set('Upload-Offset', `${transport.offset}`);
        res.set('Upload-Length', `${transport.file.size}`);
        res.set('Upload-Expires', new Date(transport.created + (7 * 86400000 /* 1 day */)).toUTCString());
        return res.send();
    }
} as Endpoint;