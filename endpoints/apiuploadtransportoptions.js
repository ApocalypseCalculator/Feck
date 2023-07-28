const jwt = require("jsonwebtoken");
const config = require('../config');

module.exports.name = "/api/upload/transport/:transportId";
module.exports.method = "OPTIONS";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.set('Tus-Resumable', '1.0.0'); //hardcoding tus version :pepega:
    res.set('Tus-Version', '1.0.0');
    res.set('Tus-Extension', 'creation,expiration');
    let user = null;
    try {
        user = jwt.verify(req.headers.authorization, config.secrets.jwt);
    }
    catch { }
    res.set('Tus-Max-Size', user ? config.filelimit.registered : config.filelimit.anon); //reply with file limit
    res.send();
}
