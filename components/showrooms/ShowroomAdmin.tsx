"use client";
import { useEffect, useState } from "react";
import type { Store, Catalog } from "@/lib/showrooms/types";
import { emptyStore } from "@/lib/showrooms/types";
type Correction = {
  id: string;
  showroom_id: string;
  message: string;
  requester_email: string;
  status: string;
  admin_notes: string;
};
export function ShowroomAdmin({ catalog }: { catalog: Catalog }) {
  const [stores, setStores] = useState<Store[]>([]),
    [s, setS] = useState<Store | null>(null),
    [q, setQ] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [hours, setHours] = useState(""),
    [requests, setRequests] = useState<Correction[]>([]);
  async function load() {
    try {
      const r = await fetch("/api/admin/showrooms", { cache: "no-store" }),
        j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setStores(j.stores);
      const cr = await fetch("/api/admin/showrooms/corrections", {
        cache: "no-store",
      });
      const cj = await cr.json();
      if (cr.ok) setRequests(cj.requests);
      else setMessage(cj.error);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const edit = (store: Store) => {
    setS(structuredClone(store));
    setHours(JSON.stringify(store.hours, null, 2));
    setMessage("");
  };
  const input = (key: keyof Store, label: string, type = "text") => (
    <label key={key} className="grid gap-1 text-sm">
      {label}
      <input
        className="border p-2"
        type={type}
        value={String(s?.[key] ?? "")}
        onChange={(e) =>
          setS((x) =>
            x
              ? {
                  ...x,
                  [key]:
                    type === "number"
                      ? e.target.value === ""
                        ? null
                        : Number(e.target.value)
                      : e.target.value,
                }
              : x,
          )
        }
        step={type === "number" ? "any" : undefined}
      />
    </label>
  );
  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-3xl font-serif">Showrooms</h1>
      <p>
        Publish verified locations. Brand carried, official dealer status and
        model trial availability are separate facts.
      </p>
      <p role="status" className="my-4">
        {message}
      </p>
      <div className="flex gap-3 my-4">
        <input
          className="border p-2"
          placeholder="Search stores"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="border px-4"
          onClick={() => edit(structuredClone(emptyStore))}
        >
          Add store
        </button>
        <button className="border px-4" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <ul className="max-h-48 overflow-auto border">
        {stores
          .filter((x) =>
            `${x.name} ${x.city}`.toLowerCase().includes(q.toLowerCase()),
          )
          .map((x) => (
            <li key={x.id}>
              <button
                className="p-2 w-full text-left border-b"
                onClick={() => edit(x)}
              >
                {x.name} · {x.city} · {x.status}
              </button>
            </li>
          ))}
      </ul>
      {s && (
        <form
          className="grid gap-5 mt-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const payload = {
                ...s,
                hours: JSON.parse(hours),
                brands: s.brands.map(
                  ({
                    brand_id,
                    carried,
                    official,
                    source_url,
                    checked_on,
                  }) => ({
                    brand_id,
                    carried,
                    official,
                    source_url,
                    checked_on,
                  }),
                ),
                models: s.models.map(
                  ({ product_id, trial, source_url, checked_on }) => ({
                    product_id,
                    trial,
                    source_url,
                    checked_on,
                  }),
                ),
              };
              const r = await fetch("/api/admin/showrooms", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }),
                j = await r.json();
              if (!r.ok) throw new Error(j.error);
              setS(null);
              setMessage("Store saved.");
              await load();
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "Could not save");
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl">{s.id ? "Edit store" : "New store"}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {input("name", "Store name")}
            {input("slug", "Unique URL slug")}
            {input("country_code", "Country code (ISO, e.g. US)")}
            {input("city", "City")}
            {input("region", "Region")}
            {input("address", "Street address")}
            {input("unit", "Floor / unit")}
            {input("latitude", "Latitude", "number")}
            {input("longitude", "Longitude", "number")}
            {input("timezone", "IANA timezone (e.g. Asia/Seoul)")}
            {input("phone", "Public store telephone")}
            {input("email", "Public store email", "email")}
            {input("website_url", "Official website", "url")}
            {input("booking_url", "Official booking URL", "url")}
            {input("source_url", "Information source URL", "url")}
            {input("checked_on", "Last verified", "date")}
          </div>
          <div className="flex flex-wrap gap-4">
            <label>
              Status
              <select
                aria-label="Status"
                className="border p-2 block"
                value={s.status}
                onChange={(e) =>
                  setS({ ...s, status: e.target.value as Store["status"] })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="private">Private</option>
              </select>
            </label>
            <p>Category: Chair store</p>
            <label>
              Visit arrangement
              <select
                className="border p-2 block"
                value={s.appointment}
                onChange={(e) =>
                  setS({
                    ...s,
                    appointment: e.target.value as Store["appointment"],
                  })
                }
              >
                <option value="unknown">Unknown</option>
                <option value="required">Appointment required</option>
                <option value="walk_in">Walk-in</option>
              </select>
            </label>
          </div>
          <label>
            Visit notes
            <textarea
              className="border p-2 w-full"
              value={s.visit_notes}
              onChange={(e) => setS({ ...s, visit_notes: e.target.value })}
            />
          </label>
          <label>
            Transport / parking
            <textarea
              className="border p-2 w-full"
              value={s.transport_notes}
              onChange={(e) => setS({ ...s, transport_notes: e.target.value })}
            />
          </label>
          <fieldset className="border p-4">
            <legend>Hours and special dates</legend>
            <p className="text-sm">
              Weekly keys: 0 Sunday–6 Saturday. null = unknown; [] = closed;
              multiple periods represent breaks. A close time earlier than or
              equal to open continues into the next day. Exceptions use
              YYYY-MM-DD and override that date, including overnight carry.
            </p>
            <textarea
              aria-label="Opening hours JSON"
              className="border p-2 w-full font-mono h-48"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </fieldset>
          <fieldset className="border p-4">
            <legend>Brands</legend>
            {s.brands.map((b, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-2 mb-3">
                <select
                  aria-label="Brand"
                  className="border p-2"
                  value={b.brand_id}
                  onChange={(e) =>
                    setS({
                      ...s,
                      brands: s.brands.map((x, n) =>
                        n === i ? { ...x, brand_id: e.target.value } : x,
                      ),
                    })
                  }
                >
                  <option value="">Choose brand</option>
                  {catalog.brands.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
                {(["carried", "official"] as const).map((k) => (
                  <label key={k}>
                    {k}
                    <select
                      className="border p-2 block"
                      value={b[k]}
                      onChange={(e) =>
                        setS({
                          ...s,
                          brands: s.brands.map((x, n) =>
                            n === i ? { ...x, [k]: e.target.value } : x,
                          ),
                        })
                      }
                    >
                      <option value="unknown">Unknown</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="unavailable">No</option>
                    </select>
                  </label>
                ))}
                <input
                  aria-label="Brand evidence URL"
                  className="border p-2"
                  type="url"
                  placeholder="Evidence URL"
                  value={b.source_url}
                  onChange={(e) =>
                    setS({
                      ...s,
                      brands: s.brands.map((x, n) =>
                        n === i ? { ...x, source_url: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  aria-label="Brand checked date"
                  className="border p-2"
                  type="date"
                  value={b.checked_on}
                  onChange={(e) =>
                    setS({
                      ...s,
                      brands: s.brands.map((x, n) =>
                        n === i ? { ...x, checked_on: e.target.value } : x,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setS({ ...s, brands: s.brands.filter((_, n) => n !== i) })
                  }
                >
                  Remove brand
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setS({
                  ...s,
                  brands: [
                    ...s.brands,
                    {
                      brand_id: "",
                      carried: "unknown",
                      official: "unknown",
                      source_url: "",
                      checked_on: "",
                    },
                  ],
                })
              }
            >
              + Brand
            </button>
          </fieldset>
          <fieldset className="border p-4">
            <legend>Exact chair models</legend>
            {s.models.map((m, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-2 mb-3">
                <select
                  aria-label="Chair model"
                  className="border p-2"
                  value={m.product_id}
                  onChange={(e) =>
                    setS({
                      ...s,
                      models: s.models.map((x, n) =>
                        n === i ? { ...x, product_id: e.target.value } : x,
                      ),
                    })
                  }
                >
                  <option value="">Choose model</option>
                  {catalog.models.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Trial availability"
                  className="border p-2"
                  value={m.trial}
                  onChange={(e) =>
                    setS({
                      ...s,
                      models: s.models.map((x, n) =>
                        n === i
                          ? { ...x, trial: e.target.value as typeof m.trial }
                          : x,
                      ),
                    })
                  }
                >
                  <option value="unknown">Ask first</option>
                  <option value="confirmed">Confirmed to try</option>
                  <option value="unavailable">Not available to try</option>
                </select>
                <input
                  aria-label="Model evidence URL"
                  className="border p-2"
                  type="url"
                  placeholder="Evidence URL"
                  value={m.source_url}
                  onChange={(e) =>
                    setS({
                      ...s,
                      models: s.models.map((x, n) =>
                        n === i ? { ...x, source_url: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  aria-label="Model checked date"
                  className="border p-2"
                  type="date"
                  value={m.checked_on}
                  onChange={(e) =>
                    setS({
                      ...s,
                      models: s.models.map((x, n) =>
                        n === i ? { ...x, checked_on: e.target.value } : x,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setS({ ...s, models: s.models.filter((_, n) => n !== i) })
                  }
                >
                  Remove model
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setS({
                  ...s,
                  models: [
                    ...s.models,
                    {
                      product_id: "",
                      trial: "unknown",
                      source_url: "",
                      checked_on: "",
                    },
                  ],
                })
              }
            >
              + Model
            </button>
          </fieldset>
          <fieldset className="border p-4">
            <legend>Optional photos</legend>
            {s.photos.map((p, i) => (
              <div className="grid sm:grid-cols-3 gap-2 my-2" key={i}>
                {(["url", "credit", "rights"] as const).map((k) => (
                  <input
                    aria-label={`Photo ${k}`}
                    className="border p-2"
                    key={k}
                    placeholder={k}
                    value={p[k]}
                    onChange={(e) =>
                      setS({
                        ...s,
                        photos: s.photos.map((x, n) =>
                          n === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      })
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setS({ ...s, photos: s.photos.filter((_, n) => n !== i) })
                  }
                >
                  Remove photo
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setS({
                  ...s,
                  photos: [...s.photos, { url: "", credit: "", rights: "" }],
                })
              }
            >
              + Photo URL
            </button>
            <p className="text-sm">
              Add a licensed photo URL, or upload using the existing image
              storage. Supply credit and usage rights before saving.
            </p>
            <input
              aria-label="Upload showroom photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.set("file", file);
                setBusy(true);
                try {
                  const r = await fetch("/api/admin/chairpedia/upload", {
                      method: "POST",
                      body: fd,
                    }),
                    j = await r.json();
                  if (!r.ok) throw new Error();
                  setS((x) =>
                    x
                      ? {
                          ...x,
                          photos: [
                            ...x.photos,
                            { url: j.url, credit: "", rights: "" },
                          ],
                        }
                      : x,
                  );
                } catch {
                  setMessage("Upload failed");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </fieldset>
          <p>
            Publishing requires name, unique slug, country, city, street
            address, coordinates, source URL and verification date. Optional
            contact, photos and hours may remain unknown.
          </p>
          <div className="flex gap-3">
            <button disabled={busy} className="bg-black text-white px-5 py-3">
              {busy ? "Saving…" : "Save store"}
            </button>
            <button type="button" onClick={() => setS(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <section className="mt-10">
        <h2 className="text-xl">Correction requests (latest 200)</h2>
        {requests.map((r) => (
          <div className="border p-3 my-3" key={r.id}>
            <p>
              {stores.find((s) => s.id === r.showroom_id)?.name ??
                r.showroom_id}{" "}
              · {r.status}
            </p>
            <p>{r.message}</p>
            <p>Private contact: {r.requester_email || "Not provided"}</p>
            <textarea
              aria-label="Internal review notes"
              className="border p-2 w-full"
              value={r.admin_notes}
              onChange={(e) =>
                setRequests((xs) =>
                  xs.map((x) =>
                    x.id === r.id ? { ...x, admin_notes: e.target.value } : x,
                  ),
                )
              }
            />
            {["resolved", "dismissed", "pending"].map((status) => (
              <button
                className="border p-2 mr-2"
                key={status}
                onClick={async () => {
                  try {
                    const res = await fetch(
                      "/api/admin/showrooms/corrections",
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: r.id,
                          status,
                          admin_notes: r.admin_notes,
                        }),
                      },
                    );
                    if (!res.ok) throw new Error();
                    await load();
                  } catch {
                    setMessage("Could not update correction");
                  }
                }}
              >
                {status}
              </button>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
