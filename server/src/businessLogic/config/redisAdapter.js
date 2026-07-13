const {createClient} = require("redis");
const {createAdapter} = require("@socket.io/redis-adapter");

async function initializeRedisAdapter(io) {
    const pubClient = createClient({url: process.env.REDIS_URL});
    const subClient = pubClient.duplicate();
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis adapter Connected");
}

module.exports = initializeRedisAdapter;