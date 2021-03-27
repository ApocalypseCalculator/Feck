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
                        value: `[Click me](https://${hostname}/uploads/${id}/${encodeURIComponent(name)})`,
                        inline: true
                    }, {
                        name: "File Size",
                        value: `${size}`,
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