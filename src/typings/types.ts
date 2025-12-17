import { Request, Response, NextFunction } from 'express';
import { User } from '../../prisma/generated';

export interface Endpoint {
    name: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
    verify?: (req: Request) => boolean;
    execute: (req: Request, res: Response, next: NextFunction) => Promise<any>;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            DATABASE_URL: string;
            JWT_SECRET: string;
            FILE_STORAGE_PATH: string;
            FRONTEND_DIST_PATH: string;
            DISCORD_WEBHOOK_URL?: string;
            MAX_UPLOAD_SIZE_MB: string;
            MAX_UPLOAD_SIZE_GUEST_MB: string;
            SITE_OWNER_NAME: string;
            SITE_OWNER_EMAIL: string;
        }
    }
}

const REQUIRED_ENV = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FILE_STORAGE_PATH',
    'FRONTEND_DIST_PATH',
    'MAX_UPLOAD_SIZE_MB',
    'MAX_UPLOAD_SIZE_GUEST_MB',
    'SITE_OWNER_NAME',
    'SITE_OWNER_EMAIL'
]

for (let varName of REQUIRED_ENV) {
    if (!process.env[varName]) {
        console.error(`Environment variable ${varName} is not set.`);
        process.exit(1);
    }
}
