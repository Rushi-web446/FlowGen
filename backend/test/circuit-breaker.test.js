const test = require("node:test");
const assert = require("node:assert/strict");
const { createCircuitBreaker } = require("../services/circuit-breaker.service");

test("circuit breaker opens after its threshold and resets after cooldown", () => {
  let clock = 0;
  const breaker = createCircuitBreaker({ threshold: 2, resetMs: 50, now: () => clock });
  breaker.failure(); breaker.failure();
  assert.equal(breaker.allow(), false);
  clock = 51;
  assert.equal(breaker.allow(), true);
  breaker.success();
  assert.equal(breaker.state(), "CLOSED");
});
