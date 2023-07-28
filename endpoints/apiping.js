module.exports.name = "/api/ping";
module.exports.method = "POST";
module.exports.verify = function (req, res) {
    return true;
}

module.exports.execute = function (req, res) {
    res.status(200).json({
        message: "pong"
    });
}