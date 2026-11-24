const assert = require("node:assert/strict");
const { test } = require("node:test");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

process.env.JWT_SECRET = "test-secret";

function runMiddleware(authorization) {
  const req = { headers: {} };
  if (authorization !== undefined) {
    req.headers.authorization = authorization;
  }

  let statusCode;
  let responseBody;
  let nextCalled = false;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  return { req, statusCode, responseBody, nextCalled };
}

test("rejects a missing authorization header", () => {
  const result = runMiddleware();
  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});

test("rejects a non-Bearer authorization scheme", () => {
  const result = runMiddleware("Basic abc123");
  assert.equal(result.statusCode, 401);
  assert.equal(result.responseBody.message, "Format token tidak valid.");
});

test("accepts a valid Bearer token", () => {
  const token = jwt.sign({ id: 7 }, process.env.JWT_SECRET);
  const result = runMiddleware(`Bearer ${token}`);
  assert.equal(result.nextCalled, true);
  assert.equal(result.req.user.id, 7);
});
