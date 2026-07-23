const createCircuitBreaker = ({ threshold = 5, resetMs = 30000, now = () => Date.now() } = {}) => {
  let failures = 0; let openedAt = null;
  return {
    allow() { if (openedAt === null) return true; if (now() - openedAt >= resetMs) return true; return false; },
    success() { failures = 0; openedAt = null; },
    failure() { failures += 1; if (failures >= threshold) openedAt = now(); },
    state() { return openedAt === null ? "CLOSED" : "OPEN"; },
  };
};
module.exports = { createCircuitBreaker };
