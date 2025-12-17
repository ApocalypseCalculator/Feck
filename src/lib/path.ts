import path from 'path';

export function getFilePath(fileId: string, fileName: string): string {
    return path.join(getFileDir(fileId), fileName);
}

export function getFileDir(fileId: string): string {
    return path.join(process.env.FILE_STORAGE_PATH, `${fileId}/`);
}
