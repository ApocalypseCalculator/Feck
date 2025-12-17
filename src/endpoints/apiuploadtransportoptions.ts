import { Endpoint } from "../typings/types";

const TUS_VERSION = "1.0.0";

export = {
    name: "/api/upload/transport/:transportId",
    method: "options",
    execute: async (req, res, _) => {
        res.setHeader('Tus-Resumable', TUS_VERSION);
        res.setHeader('Tus-Version', TUS_VERSION);
        res.setHeader('Tus-Extension', 'creation,expiration');
        let limit = parseInt((req.user ? process.env.MAX_UPLOAD_SIZE_MB : process.env.MAX_UPLOAD_SIZE_GUEST_MB) || "0") * 1024 * 1024;
        res.setHeader('Tus-Max-Size', `${limit}`);
        return res.send();
    }
} as Endpoint;