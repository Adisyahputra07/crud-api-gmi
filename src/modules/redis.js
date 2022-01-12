const redis = require("redis");

const redisClient = redis.createClient({
  port: process.env.PORT_REDIS,
  host: process.env.HOST_REDIS,
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

redisClient.connect();

redisClient.on("connect", () => console.log("redis is connect"));

module.exports = redisClient;
