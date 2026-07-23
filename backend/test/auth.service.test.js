const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/flowgen-test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";

const users = new Map();
let nextUserId = 1;
const repositoryPath = require.resolve("../repository/user.repository");

require.cache[repositoryPath] = {
  id: repositoryPath,
  filename: repositoryPath,
  loaded: true,
  exports: {
    findByEmail: async (email) => users.get(email),
    addUser: async (user) => {
      const createdUser = { ...user, _id: String(nextUserId++) };
      users.set(createdUser.email, createdUser);
      return createdUser;
    },
  },
};

const { SignupService, LoginService } = require("../services/auth.service");

test("signup hashes the password and returns a JWT", async () => {
  const result = await SignupService({
    name: "Test User",
    email: "test@example.com",
    password: "correct-horse-battery-staple",
  });

  assert.equal(result.user.email, "test@example.com");
  assert.ok(result.token.length > 20);
  assert.notEqual(users.get("test@example.com").password, "correct-horse-battery-staple");
});

test("login rejects an incorrect password", async () => {
  await assert.rejects(
    LoginService({ email: "test@example.com", password: "incorrect-password" }),
    /Invalid email or password/,
  );
});
