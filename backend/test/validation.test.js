const test = require("node:test");
const assert = require("node:assert/strict");
const { signupSchema } = require("../validation/auth.schemas");
const { generateOutlineSchema, generateLessonSchema } = require("../validation/course.schemas");

test("signup schema rejects weak passwords and malformed email addresses", () => {
  const result = signupSchema.safeParse({
    body: { name: "A", email: "invalid-email", password: "short" },
    params: {},
    query: {},
  });

  assert.equal(result.success, false);
});

test("course generation schema accepts a bounded prompt", () => {
  const result = generateOutlineSchema.safeParse({
    body: { prompt: "Build a practical JavaScript interview preparation roadmap" },
    params: {},
    query: {},
  });

  assert.equal(result.success, true);
});

test("lesson generation schema rejects invalid lesson identifiers", () => {
  const result = generateLessonSchema.safeParse({
    body: { lessonId: "not-an-object-id" },
    params: {},
    query: {},
  });

  assert.equal(result.success, false);
});
