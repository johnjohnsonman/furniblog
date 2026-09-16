// Isolated PostgreSQL-in-WASM. No .env loading, remote database, or production credentials.
const { PGlite } = require("@electric-sql/pglite");
const fs = require("node:fs");
const path = require("node:path");
const brand = "10000000-0000-4000-8000-000000000001",
  model = "20000000-0000-4000-8000-000000000001";
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;
 create table brands(id uuid primary key,name text,slug text); create table products(id uuid primary key,name text,slug text,brand_id uuid,published boolean,track text);
 grant select on brands,products to anon,authenticated,service_role;
 insert into brands values('${brand}','Test brand','test-brand');insert into products values('${model}','Test chair','test-chair','${brand}',true,'chair');`);
  await db.exec(
    fs.readFileSync(
      path.join(
        __dirname,
        "../lib/supabase/migrations/046_showroom_finder.sql",
      ),
      "utf8",
    ),
  );
  const base = {
    slug: "fixture-london",
    name: "Test showroom — London",
    status: "published",
    country_code: "GB",
    city: "London",
    region: "",
    address: "Test address (not a real store)",
    unit: "",
    latitude: 51.51,
    longitude: -0.12,
    timezone: "Europe/London",
    phone: "+440000000000",
    email: "store@example.com",
    website_url: "https://example.com",
    booking_url: "",
    store_type: "retailer",
    appointment: "walk_in",
    hours: {
      weekly: {
        0: [],
        1: [{ open: "09:00", close: "18:00" }],
        2: [
          { open: "09:00", close: "12:00" },
          { open: "13:00", close: "18:00" },
        ],
        3: [],
        4: [],
        5: [],
        6: [],
      },
      exceptions: {},
    },
    visit_notes: "Development fixture only. Not a real business.",
    transport_notes: "",
    photos: [],
    source_url: "https://example.com",
    checked_on: "2026-09-15",
    brands: [
      {
        brand_id: brand,
        carried: "confirmed",
        official: "unknown",
        source_url: "",
        checked_on: "",
      },
    ],
    models: [
      {
        product_id: model,
        trial: "confirmed",
        source_url: "https://example.com",
        checked_on: "2026-09-15",
      },
    ],
  };
  for (const [i, extra] of [
    {},
    {
      slug: "fixture-overlap",
      name: "Test showroom — same location",
      appointment: "required",
      models: [],
    },
    {
      slug: "fixture-tokyo",
      name: "Test showroom — Tokyo",
      city: "Tokyo",
      country_code: "JP",
      timezone: "Asia/Tokyo",
      latitude: 35.68,
      longitude: 139.76,
    },
    {
      slug: "fixture-dateline",
      name: "Test showroom — Dateline",
      city: "Test city",
      country_code: "FJ",
      latitude: -17,
      longitude: 179.9,
    },
    { slug: "fixture-private", name: "Private fixture", status: "private" },
    { slug: "fixture-draft", name: "Draft fixture", status: "draft" },
  ].entries()) {
    const s = {
      ...base,
      ...extra,
      id: `30000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    };
    await db.query("select save_showroom($1::jsonb,null)", [JSON.stringify(s)]);
  }
  return db;
}
module.exports = { setup, brand, model };
if (require.main === module) {
  (async () => {
    const db = await setup();
    if (process.env.SHOWROOM_SEED_FILE) {
      const seed = JSON.parse(fs.readFileSync(process.env.SHOWROOM_SEED_FILE, "utf8"));
      if (!["japan-local-preview", "us-japan-local-preview"].includes(seed.scope) || !Array.isArray(seed.stores)) throw new Error("Invalid local seed");
      await db.transaction(async tx => {
        await tx.exec("delete from showroom_corrections; delete from showroom_models; delete from showroom_brands; delete from showrooms; delete from products; delete from brands;");
        for (const b of seed.catalog?.brands || []) {
          await tx.query("insert into brands(id,name,slug) values($1,$2,$3)", [b.id,b.name,b.slug]);
        }
        for (const m of seed.catalog?.models || []) {
          await tx.query("insert into products(id,name,slug,brand_id,published,track) values($1,$2,$3,$4,true,'chair')", [m.id,m.name,m.slug,m.brand_id]);
        }
        for (const s of seed.stores) {
          const countries = seed.scope === "japan-local-preview" ? ["JP"] : ["JP", "US"];
          if (!countries.includes(s.country_code)) throw new Error("Country outside local seed scope");
          await tx.query("select save_showroom($1::jsonb,null)", [JSON.stringify(s)]);
        }
      });
    }
    const http = require("node:http");
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1:4317"),
          table = url.pathname.split("/").pop();
        const allowed = [
          "showrooms",
          "showroom_corrections",
          "brands",
          "products",
          "save_showroom",
        ];
        if (!allowed.includes(table)) {
          res.writeHead(404);
          return res.end("{}");
        }
        let body = "";
        for await (const c of req) {
          body += c;
          if (body.length > 120000) throw new Error("too large");
        }
        const payload = body ? JSON.parse(body) : null,
          service = req.headers.authorization === "Bearer local-service-only";
        const result = await db.transaction(async (tx) => {
          await tx.exec(`set local role ${service ? "service_role" : "anon"}`);
          if (table === "save_showroom") {
            const r = await tx.query(
              "select save_showroom($1::jsonb,$2::timestamptz) as id",
              [JSON.stringify(payload.payload), payload.expected_updated_at],
            );
            return r.rows[0].id;
          }
          if (req.method === "POST" && table === "showroom_corrections") {
            await tx.query(
              "insert into showroom_corrections(showroom_id,message,requester_email) values($1,$2,$3)",
              [payload.showroom_id, payload.message, payload.requester_email],
            );
            return null;
          }
          const params = [],
            where = [];
          for (const k of ["id", "status", "published", "track"]) {
            const v = url.searchParams.get(k);
            if (v?.startsWith("eq.")) {
              params.push(v.slice(3));
              where.push(`"${k}"=$${params.length}`);
            } else if (k === "id" && v?.startsWith("in.(")) {
              params.push(v.slice(4, -1).split(","));
              where.push(`id=any($${params.length}::uuid[])`);
            }
          }
          if (req.method === "PATCH" && table === "showroom_corrections") {
            await tx.query(
              "update showroom_corrections set status=$1,admin_notes=$2 where id=$3",
              [
                payload.status,
                payload.admin_notes,
                url.searchParams.get("id")?.slice(3),
              ],
            );
            return null;
          }
          const limit = Math.min(
              1000,
              Math.max(1, Number(url.searchParams.get("limit") || 500)),
            ),
            offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
          const r = await tx.query(
            `select *${table === "showrooms" ? ",updated_at::text as updated_at" : ""} from ${table}${where.length ? " where " + where.join(" and ") : ""} order by id limit ${limit} offset ${offset}`,
            params,
          );
          if (
            table === "showrooms" &&
            url.searchParams.get("select")?.includes("showroom_brands")
          )
            for (const s of r.rows) {
              s.brands = (
                await tx.query(
                  "select * from showroom_brands where showroom_id=$1",
                  [s.id],
                )
              ).rows;
              s.models = (
                await tx.query(
                  "select * from showroom_models where showroom_id=$1",
                  [s.id],
                )
              ).rows;
            }
          if (req.headers.accept?.includes("vnd.pgrst.object"))
            return r.rows[0] ?? null;
          return r.rows;
        });
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ code: e.code || "TEST_ERROR", message: e.message }),
        );
      }
    });
    const port = Number(process.env.SHOWROOM_TEST_PORT || 4317);
    server.listen(port, "127.0.0.1", () =>
      console.log(
        `Isolated showroom PostgreSQL test adapter: http://127.0.0.1:${port} (local data only)`,
      ),
    );
  })().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
