import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import { getFilePath } from "../lib/path";
import fs from 'fs/promises';

export = {
    name: "/api/upload/transport/:transportId",
    method: "delete",
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
        let filepath = getFilePath(transport.file.id, transport.file.name);
        await prisma.upload.update({
            where: {
                transportId: req.params.transportId
            },
            data: {
                completed: true,
                file: {
                    update: {
                        deleted: true
                    }
                }
            }
        });
        try {
            await fs.unlink(filepath);
        } catch { }
        res.set('Cache-Control', 'no-store');
        return res.status(204).json({ success: true });
    }
} as Endpoint;