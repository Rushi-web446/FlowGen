const { redisConnection } = require("./connection");

setInterval(async () => {
    try {
        await redisConnection.ping();
    } catch (err) {
        console.log("Ping failed");
    }
}, 60000);