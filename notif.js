const axios = require('axios').default;
const config = require('./config');

module.exports.sendNotif = (name, id, hostname, ip, size) => {
    return new Promise((resolve, reject) => {
        if (config.discord.on) {
            axios.post(`${config.discord.webhook}`, {
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
                        value: `[Click me](https://${hostname}/uploads/?fileid=${id})`,
                        inline: true
                    }, {
                        name: "File Size",
                        value: `${formatSize(parseInt(size))}`,
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
            }).then(() => resolve()).catch(e => { reject(e) });
        }
        else {
            resolve();
        }
    })
}

function formatSize(number) {
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
