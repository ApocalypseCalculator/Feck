import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import { nanoid } from "nanoid";

export = {
    name: "/api/recover",
    method: "post",
    verify: (req) => {
        return !req.user;
    },
    execute: async (req, res, _) => {
        if (!req.body.username || !req.body.password || !req.body.recovery) {
            return res.status(400).json({ error: `Invalid form` });
        }
        if (!/^\w+$/.test(req.body.password) || req.body.password.length < 8) {
            return res.status(400).json({ error: `Passwords can only contain alphanumeric characters or underscores and must be at least 8 characters` });
        }
        let user = await prisma.user.findUnique({
            where: {
                username: req.body.username
            }
        })
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        let result = await bcrypt.compare(req.body.recovery, user.recovery);
        if(!result) {
            return res.status(401).json({ error: "Invalid recovery code" });
        }
        let pwdhash = await bcrypt.hash(req.body.password, 10);
        let recovery = nanoid(25);
        let rechash = await bcrypt.hash(recovery, 10);
        await prisma.user.update({
            where: {
                username: req.body.username
            },
            data: {
                password: pwdhash,
                recovery: rechash
            }
        });
        return res.json({ recovery: recovery });
    }
} as Endpoint;