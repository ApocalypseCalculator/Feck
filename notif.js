const axios = require('axios').default;
const config = require('./config');

module.exports.sendNotif = (name, id, sizeBytes, hostname, ip) => {
    if (config.discord.on) {
        axios.post(`${config.discord.webhook}`, {
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
                    value: `[Click me](https://${hostname}/uploads/${id}/${name})`,
                    inline: true
                }, {
                    name: "File Size",
                    value: `${formatSize(sizeBytes)}`,
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
        }).catch(e => console.log("Error occurred. Could not send notification"));
    }
}

function formatSize(number) {
    if (number >= 1024 * 1024) {
        let mbSize = parseInt(number / (1024 * 1024));
        return `${mbSize}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "MB";
    }
    else if (number >= 1024) {
        let kbSize = parseInt(number / (1024));
        return `${kbSize}KB`;
    }
    else {
        return `${number}B`;
    }
}