import axios from "axios";

export async function sendNotif(name: string, id: string, hostname: string, ip: string, size: number, isprivate: boolean): Promise<void> {
    if (process.env.DISCORD_WEBHOOK_URL) {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {
            username: "Feck Files Upload Notification",
            avatar_url: `https://${hostname}/site/files/icon.png`,
            embeds: [{
                title: "New Upload",
                description: 'New File Uploaded to the Feck Files Drive',
                color: "3066993",
                fields: [{
                    name: "File Name",
                    value: `${name}`,
                    inline: true
                }, {
                    name: "File ID",
                    value: `${id}`,
                    inline: true
                }, {
                    name: "Access URL",
                    value: `[Click me](https://${hostname}/${isprivate ? 'download' : 'uploads/'}?fileid=${id})`,
                    inline: true
                }, {
                    name: "File Size",
                    value: `${formatSize(size)}`,
                    inline: true
                }, {
                    name: "Uploader IP",
                    value: `${ip}`,
                    inline: true
                }, {
                    name: "Timestamp",
                    value: `${new Date().toUTCString()}`,
                    inline: true
                }]
            }],
        });
    }
    return;
}

function formatSize(number: number) {
    if (number >= 1024 * 1024) {
        let mbSize = number / (1024 * 1024);
        return `${mbSize.toFixed(1)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "MB";
    }
    else if (number >= 1024) {
        let kbSize = number / (1024);
        return `${kbSize.toFixed(1)}KB`;
    }
    else {
        return `${number}B`;
    }
}
