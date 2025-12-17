import { Endpoint } from "../typings/types";
import pkg from '../../package.json';

// TODO: come back to this
export = {
    name: "/api/info",
    method: "get",
    execute: async (req, res, _) => {
        res.json({
            name: process.env.SITE_OWNER_NAME,
            email: process.env.SITE_OWNER_EMAIL,
            version: pkg.version,
            filelimit: {
                anon: parseInt(process.env.MAX_UPLOAD_SIZE_GUEST_MB || "0") * 1024 * 1024,
                registered: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "0") * 1024 * 1024
            }
        })
    }
} as Endpoint;