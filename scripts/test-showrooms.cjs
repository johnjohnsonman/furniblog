const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript"),
  Module = require("node:module");
function load(file) {
  const p = path.resolve(__dirname, "..", file),
    m = new Module(p, module);
  m.filename = p;
  m.paths = Module._nodeModulePaths(path.dirname(p));
  m.require = (name) =>
    name === "./domain" ? load("lib/showrooms/domain.ts") : name === "./locations" ? load("lib/showrooms/locations.ts") : require(name);
  m._compile(
    ts.transpileModule(fs.readFileSync(p, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    p,
  );
  return m.exports;
}
const {
    hoursState,
    inBounds,
    compactBounds,
    filterStores,
    contactLinks,
    httpUrl,
  } = load("lib/showrooms/domain.ts"),
  { storeSchema } = load("lib/showrooms/validation.ts");
async function main() {
  assert(inBounds(0, -179, [170, -10, 190, 10]));
  assert(inBounds(0, 181, [170, -10, -170, 10]));
  assert(!inBounds(0, 0, [170, -10, -170, 10]));
  assert(inBounds(0, 100, [-200, -10, 200, 10]));
  assert.deepEqual(
    compactBounds([
      [179, 0],
      [-179, 1],
    ]),
    [
      [179, 0],
      [181, 1],
    ],
  );
  const h = {
    weekly: {
      0: [],
      1: [{ open: "22:00", close: "02:00" }],
      2: [
        { open: "09:00", close: "12:00" },
        { open: "13:00", close: "18:00" },
      ],
    },
    exceptions: {},
  };
  assert.equal(
    hoursState(h, "Asia/Seoul", new Date("2026-09-14T16:00:00Z")).state,
    "open",
  );
  assert.equal(
    hoursState(h, "Asia/Seoul", new Date("2026-09-15T03:30:00Z")).state,
    "closed",
  );
  assert.equal(
    hoursState(
      { ...h, exceptions: { "2026-09-15": [] } },
      "Asia/Seoul",
      new Date("2026-09-14T16:00:00Z"),
    ).state,
    "closed",
  );
  assert.equal(hoursState(h, "invalid/timezone").state, "unknown");
  assert.equal(
    hoursState({ weekly: {}, exceptions: {} }, "UTC").state,
    "unknown",
  );
  assert.equal(httpUrl("javascript:alert(1)"), null);
  assert.equal(httpUrl("https://user:pass@example.com"), null);
  const { setup, brand, model } = require("./showroom-test-db.cjs");
  const db = await setup();
  const rows = (
      await db.query("select *,updated_at::text as updated_at from showrooms")
    ).rows,
    first = rows.find((s) => s.slug === "fixture-london");
  first.brands = (
    await db.query("select * from showroom_brands where showroom_id=$1", [
      first.id,
    ])
  ).rows;
  first.models = (
    await db.query("select * from showroom_models where showroom_id=$1", [
      first.id,
    ])
  ).rows;
  const payload = {
    ...first,
    updated_at: String(first.updated_at),
    brands: first.brands.map(({ showroom_id, ...x }) => x),
    models: first.models.map(({ showroom_id, ...x }) => x),
  };
  assert(storeSchema.safeParse(payload).success);
  assert(!storeSchema.safeParse({ ...payload, phone: "---" }).success);
  assert(!storeSchema.safeParse({ ...payload, hours: { weekly: {}, exceptions: { "2026-02-30": [] } } }).success);
  assert(!storeSchema.safeParse({ ...payload, latitude: null }).success);
  assert(
    !storeSchema.safeParse({ ...payload, website_url: "javascript:alert(1)" })
      .success,
  );
  const f = {
    q: "",
    brand: "",
    model,
    confirmed: false,
    appointment: "",
    type: "",
  };
  assert.equal(filterStores([first], f, brand).length, 1);
  assert.equal(
    filterStores([{ ...first, models: [] }], { ...f, confirmed: true }, brand)
      .length,
    0,
  );
  assert.equal(
    filterStores(
      [{ ...first, models: [{ product_id: model, trial: "unavailable" }] }],
      f,
      brand,
    ).length,
    0,
  );
  assert.equal(
    filterStores([{ ...first, status: "private" }], f, brand).length,
    0,
  );
  assert(contactLinks(first).some((l) => l.href.startsWith("tel:")));
  assert(
    !contactLinks({
      ...first,
      email: "",
      phone: "",
      booking_url: "",
      website_url: "",
    }).some((l) => l.kind !== "directions"),
  );
  const anon = await db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    return (await tx.query("select * from showrooms")).rows;
  });
  assert.equal(anon.length, 4);
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      await tx.query("select * from showroom_corrections");
    }),
  );
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec("set local role authenticated");
      await tx.query("update showrooms set name='attack'");
    }),
  );
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      await tx.query("select save_showroom($1::jsonb,null)", [
        JSON.stringify(payload),
      ]);
    }),
  );
  await assert.rejects(
    db.query("select save_showroom($1::jsonb,$2)", [
      JSON.stringify(payload),
      "2000-01-01T00:00:00Z",
    ]),
  );
  await assert.rejects(
    db.query("select save_showroom($1::jsonb,$2)", [
      JSON.stringify({
        ...payload,
        name: "Should roll back",
        models: [
          {
            product_id: "99999999-9999-4999-8999-999999999999",
            trial: "unknown",
            source_url: "",
            checked_on: "",
          },
        ],
      }),
      payload.updated_at,
    ]),
  );
  assert.equal(
    (await db.query("select name from showrooms where id=$1", [first.id]))
      .rows[0].name,
    first.name,
  );
  await db.query("select save_showroom($1::jsonb,$2)", [
    JSON.stringify({ ...payload, status: "private" }),
    payload.updated_at,
  ]);
  const visible = await db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    return (
      await tx.query("select * from showroom_models where showroom_id=$1", [
        first.id,
      ])
    ).rows;
  });
  assert.equal(visible.length, 0);
  await db.close();
  console.log(
    "PASS: date line, timezone/overnight/break/exception hours, validation, filters, contacts, RLS, private relations, atomic rollback and stale updates.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
