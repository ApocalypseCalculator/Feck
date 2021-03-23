const axios = require('axios').default;
const config = require('./config');
const fs = require('fs');

module.exports.sendNotif = (name, id, hostname, ip) => {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            if (config.discord.on) {
                let sizeBytes = fs.statSync(`./uploads/${id}/${name}`).size;
                console.log(sizeBytes);
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
                            value: `[Click me](https://${hostname}/uploads/${id}/${encodeURIComponent(name)})`,
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
                }).then(() => resolve()).catch(e => { reject(e) });
            }
            else {
                resolve();
            }
        }, 500);
    })
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