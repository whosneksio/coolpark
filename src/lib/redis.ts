import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

let connecting: Promise<unknown> | null = null;

export async function getRedis() {
  if (!redis.isOpen) {
    connecting ??= redis.connect().finally(() => {
      connecting = null;
    });

    await connecting;
  }

  return redis;
}