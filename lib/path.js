const path = require('path');

module.exports.getFilePath = (fileId, fileName) => {
    return path.join(this.getFileDir(fileId), fileName);
}

module.exports.getFileDir = (fileId) => {
    return path.join(__dirname, `../uploads/${fileId}/`);
}
