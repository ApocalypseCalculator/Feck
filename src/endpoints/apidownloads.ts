import { Endpoint } from "../typings/types";
import prisma from '../lib/db';

export = {
    name: "/api/downloads",
    method: "get",
    execute: async (req, res, _) => {
        // single file query
        if (req.query.fileid && typeof req.query.fileid === 'string') {
            let file = await prisma.file.findFirst({
                where: {
                    AND: [
                        {
                            id: req.query.fileid
                        },
                        {
                            deleted: false
                        },
                        {
                            OR: [
                                {
                                    upload: {
                                        is: null
                                    }
                                },
                                {
                                    upload: {
                                        completed: true
                                    }
                                }
                            ]
                        }
                    ]
                },
                include: {
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            });
            if (!file ||
                (file.type === 'private' &&
                    (!req.user || file.userid !== req.user?.id))) {
                return res.status(404).json({ error: "File not found" });
            }
            return res.json(file);
        }
        else {
            // file list query
            let files = await prisma.file.findMany({
                where: {
                    AND: [
                        {
                            deleted: false
                        },
                        {
                            OR: [
                                {
                                    type: "public",
                                },
                                {
                                    AND: {
                                        userid: req.user ? req.user.id : "-1",
                                    }
                                }
                            ]
                        },
                        {
                            OR: [
                                {
                                    upload: {
                                        is: null
                                    }
                                },
                                {
                                    upload: {
                                        completed: true
                                    }
                                }
                            ]
                        }
                    ],
                },
                include: {
                    user: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            })
            return res.json(files);
        }
    }
} as Endpoint;