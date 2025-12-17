import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import fs from 'fs/promises';
import path from "path";
import { getFilePath } from "../lib/path";
import contentDisposition from "content-disposition";

export = {
    name: "/uploads/{*path}",
    method: "get",
    verify: (req) => {
        return !req.user;
    },
    execute: async (req, res, next) => {
        if (!req.query.fileid) return next();
        let file = await prisma.file.findUnique({
            where: {
                id: req.query.fileid as string
            },
            include: {
                upload: true
            }
        });
        if (!file || (file.upload && !file.upload.completed) || file.deleted) {
            return next();
        }
        if (file.type == "private" && (!req.user || req.user.id != file.userid)) {
            return next();
        }

        let filepath = getFilePath(file.id, file.name);
        try {
            await fs.access(filepath, fs.constants.R_OK);
            res.setHeader('Content-Disposition', contentDisposition(filepath, { type: req.query.inline ? 'inline' : 'attachment' }));
            return res.sendFile(path.resolve(filepath));
        }
        catch {
            return next();
        }
    }
} as Endpoint;
