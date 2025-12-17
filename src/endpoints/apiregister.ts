import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import { nanoid } from "nanoid";

export = {
    name: "/api/register",
    method: "post",
    verify: (req) => {
        return !req.user;
    },
    execute: async (req, res, _) => {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ error: `Invalid form` });
        }

        let userExists = await prisma.user.findUnique({
            where: {
                username: req.body.username
            }
        });
        if (userExists) {
            return res.status(409).json({ error: `Username already taken` });
        }

        if (!/^\w+$/.test(req.body.username) || req.body.username.length > 32) {
            return res.status(400).json({ error: `Usernames can only contain alphanumeric characters or underscores and must be at most 33 characters` });
        }
        if (!/^\w+$/.test(req.body.password) || req.body.password.length < 8) {
            return res.status(400).json({ error: `Passwords can only contain alphanumeric characters or underscores and must be at least 8 characters` });
        }

        let pwdhash = await bcrypt.hash(req.body.password, 10);
        let recovery = nanoid(25);
        let rechash = await bcrypt.hash(recovery, 10);

        let userid = nanoid(16);
        await prisma.user.create({
            data: {
                id: userid,
                username: req.body.username,
                password: pwdhash,
                recovery: rechash,
                registertime: Date.now()
            }
        });
        return res.json({ recovery: recovery });
    }
} as Endpoint;