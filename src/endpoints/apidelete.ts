import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import { getFilePath } from "../lib/path";
import fs from 'fs/promises';

export = {
    name: "/api/delete",
    method: "delete",
    verify: (req) => {
        return !!req.user;
    },
    execute: async (req, res, _) => {
        if (!req.body.fileid) return res.status(400).json({ error: `Please include file ID to delete` });
        let file = await prisma.file.findUnique({
            where: {
                id: req.body.fileid
            }
        });

        if (!file) return res.status(404).json({ error: `File not found` });

        if (req.user?.id !== file.userid) return res.status(403).json({ error: `Unauthorized` });

        await prisma.file.update({
            where: {
                id: file.id
            },
            data: {
                deleted: true
            }
        });
        let filepath = getFilePath(file.id, file.name);
        try {
            await fs.unlink(filepath); // delete if exists
        } catch {}
        return res.json({ message: `Deleted` });
    }
} as Endpoint;