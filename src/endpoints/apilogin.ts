import { Endpoint } from "../typings/types";
import prisma from '../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export = {
    name: "/api/login",
    method: "post",
    verify: (req) => {
        return !req.user;
    },
    execute: async (req, res, _) => {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ error: `Invalid form` });
        }
        let user = await prisma.user.findUnique({
            where: {
                username: req.body.username
            }
        });
        let result = await bcrypt.compare(req.body.password, user ? user.password : '');
        if (!user || !result) {
            return res.status(401).json({ error: "Incorrect password or username" });
        }
        let token = jwt.sign({
            username: user.username,
            userid: user.id,
            registertime: user.registertime
        }, process.env.JWT_SECRET);
        return res.json({ token: token });
    }
} as Endpoint;