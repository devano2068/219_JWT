const assert = require("node:assert/strict");
const { test } = require("node:test");
const db = require("../models");
const { getProfile, register } = require("../controllers/userController");

async function runRegister(body) {
  const req = { body };
  let statusCode;
  let responseBody;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      responseBody = value;
      return this;
    },
  };
  await register(req, res);
  return { statusCode, responseBody };
}

async function runProfile(userId) {
  const req = { user: { id: userId } };
  let statusCode;
  let responseBody;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      responseBody = value;
      return this;
    },
  };
  await getProfile(req, res);
  return { statusCode, responseBody };
}

test("rejects malformed registration email before querying users", async () => {
  const originalFindOne = db.User.findOne;
  let queried = false;
  db.User.findOne = async () => {
    queried = true;
    return null;
  };

  try {
    const result = await runRegister({ email: "not-an-email", password: "pass1234" });
    assert.equal(result.statusCode, 400);
    assert.equal(queried, false);
  } finally {
    db.User.findOne = originalFindOne;
  }
});

test("normalizes registration email before checking for duplicates", async () => {
  const originalFindOne = db.User.findOne;
  let queriedEmail;
  db.User.findOne = async ({ where }) => {
    queriedEmail = where.email;
    return {};
  };

  try {
    const result = await runRegister({ email: "  USER@Example.COM  ", password: "pass1234" });
    assert.equal(queriedEmail, "user@example.com");
    assert.equal(result.statusCode, 409);
  } finally {
    db.User.findOne = originalFindOne;
  }
});

test("returns only the authenticated user's public profile fields", async () => {
  const originalFindByPk = db.User.findByPk;
  db.User.findByPk = async () => ({
    id: 12,
    email: "reader@example.com",
    password: "hashed-secret",
  });

  try {
    const result = await runProfile(12);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.responseBody, {
      id: 12,
      email: "reader@example.com",
    });
  } finally {
    db.User.findByPk = originalFindByPk;
  }
});
