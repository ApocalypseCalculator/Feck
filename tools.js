const config = require('./config');

module.exports.configChecks = () => {
    console.log('Starting config check...');
    if (typeof config.database.sqlite !== "boolean") {
        console.log("Config database SQLite must be of type boolean");
        process.exit(1);
    }
    else if (typeof config.discord.on !== "boolean") {
        console.log("Config discord on must be of type boolean");
        process.exit(1);
    }
    else if (typeof config.ratelimit.time !== "number") {
        console.log("Config ratelimit time must be of type number");
        process.exit(1);
    }
    else if (typeof config.ratelimit.requests !== "number") {
        console.log("Config ratelimit requests must be of type number");
        process.exit(1);
    }
    else if (config.name === "") {
        console.log("Config name must not be empty");
        process.exit(1);
    }
    else if (config.email === "") {
        console.log("Config email must not be empty");
        process.exit(1);
    }
    else {
        console.log('All checks passed');
    }
}