const assert = require("node:assert/strict");
const { test } = require("node:test");
const db = require("../models");
const { getAllKomik } = require("../controllers/komikController");

async function runGetAll(query) {
  const req = { query };
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
  await getAllKomik(req, res);
  return { statusCode, responseBody };
}

test("applies bounded limit and offset to comic listings", async () => {
  const originalFindAll = db.Komik.findAll;
  let options;
  db.Komik.findAll = async (value) => {
    options = value;
    return [];
  };

  try {
    const result = await runGetAll({ limit: "25", offset: "50" });
    assert.deepEqual(options, { limit: 25, offset: 50 });
    assert.equal(result.statusCode, 200);
  } finally {
    db.Komik.findAll = originalFindAll;
  }
});

test("rejects out-of-range comic listing limits", async () => {
  const originalFindAll = db.Komik.findAll;
  let queried = false;
  db.Komik.findAll = async () => {
    queried = true;
    return [];
  };

  try {
    const result = await runGetAll({ limit: "101" });
    assert.equal(result.statusCode, 400);
    assert.equal(queried, false);
  } finally {
    db.Komik.findAll = originalFindAll;
  }
});
