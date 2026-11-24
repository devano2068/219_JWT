const assert = require("node:assert/strict");
const { test } = require("node:test");
const db = require("../models");
const {
  createKomik,
  getAllKomik,
  updateKomik,
} = require("../controllers/komikController");

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

async function runController(controller, req) {
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
  await controller(req, res);
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

test("rejects comic creation without required fields", async () => {
  const originalCreate = db.Komik.create;
  let created = false;
  db.Komik.create = async () => {
    created = true;
  };

  try {
    const result = await runController(createKomik, {
      body: { title: "   ", author: "Author" },
    });
    assert.equal(result.statusCode, 400);
    assert.equal(created, false);
  } finally {
    db.Komik.create = originalCreate;
  }
});

test("updates only the supplied comic fields", async () => {
  const originalFindByPk = db.Komik.findByPk;
  const comic = {
    title: "Existing title",
    description: "Old description",
    author: "Existing author",
    async save() {},
  };
  db.Komik.findByPk = async () => comic;

  try {
    const result = await runController(updateKomik, {
      params: { id: "1" },
      body: { description: "New description" },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(comic.title, "Existing title");
    assert.equal(comic.author, "Existing author");
    assert.equal(comic.description, "New description");
  } finally {
    db.Komik.findByPk = originalFindByPk;
  }
});

test("rejects empty comic updates", async () => {
  const originalFindByPk = db.Komik.findByPk;
  let queried = false;
  db.Komik.findByPk = async () => {
    queried = true;
    return null;
  };

  try {
    const result = await runController(updateKomik, {
      params: { id: "1" },
      body: {},
    });
    assert.equal(result.statusCode, 400);
    assert.equal(queried, false);
  } finally {
    db.Komik.findByPk = originalFindByPk;
  }
});
