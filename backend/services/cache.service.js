const memoryCache = new Map();
const redisConnection = process.env.NODE_ENV === "test" ? null : require("../redis/connection").redisConnection;

const courseKey = (courseId, userId) => `course:${userId}:${courseId}`;
const getCourseCache = async (courseId, userId) => {
  const key = courseKey(courseId, userId);
  const value = redisConnection ? await redisConnection.get(key) : memoryCache.get(key);
  return value ? JSON.parse(value) : null;
};
const setCourseCache = (courseId, userId, value) => redisConnection
  ? redisConnection.set(courseKey(courseId, userId), JSON.stringify(value), "EX", 300)
  : Promise.resolve(memoryCache.set(courseKey(courseId, userId), JSON.stringify(value)));
const invalidateCourseCache = (courseId, userId) => redisConnection
  ? redisConnection.del(courseKey(courseId, userId))
  : Promise.resolve(memoryCache.delete(courseKey(courseId, userId)));
module.exports = { getCourseCache, setCourseCache, invalidateCourseCache };
