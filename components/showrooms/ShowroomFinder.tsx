"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasMap, type MapCommand } from "./AtlasMap";
import { StoreDetails } from "./StoreDetails";
import type { Store, StorePreview, Catalog } from "@/lib/showrooms/types";
import { filterStores, type Filters } from "@/lib/showrooms/domain";
import { cityKey } from "@/lib/showrooms/locations";
import "./atlas.css";
import { AtlasHeader } from "./AtlasHeader";
export function ShowroomFinder({
  stores,
  catalog,
  initialModel = "",
  initialCountry = "",
  initialCity = "",
  unavailable = false,
  correctionsEnabled = true,
}: {
  stores: StorePreview[];
  catalog: Catalog;
  initialModel?: string;
  initialCountry?: string;
  initialCity?: string;
  unavailable?: boolean;
  correctionsEnabled?: boolean;
}) {
  const [f, setF] = useState<Filters>({
      q: "",
      country: initialCountry,
      city: initialCity,
      brand: "",
      model: initialModel,
      confirmed: false,
      appointment: "",
      type: "",
    }),
    [selected, setSelected] = useState(""),
    [pick, setPick] = useState<string[]>([]),
    [collapsed, setCollapsed] = useState(false),
    [filters, setFilters] = useState(false),
    [sheet, setSheet] = useState(32),
    [dragging, setDragging] = useState(false);
  const [detailStore, setDetailStore] = useState<Store | null>(null),
    [detailState, setDetailState] = useState<"idle" | "loading" | "error">("idle");
  const [command, setCommand] = useState<MapCommand>({ id: initialCountry ? 1 : 0, kind: initialCountry ? "fit" : "world" }),
    stage = useRef<HTMLDivElement>(null),
    handle = useRef<HTMLButtonElement>(null),
    drag = useRef<{ y: number; height: number } | null>(null),
    savedSheet = useRef(32);
  const [visibleCount, setVisibleCount] = useState(24);
  const model = catalog.models.find((m) => m.id === f.model),
    results = useMemo(
      () => filterStores(stores, f, model?.brand_id),
      [stores, f, model?.brand_id],
    ),
    detail = stores.find((s) => s.id === selected);
  useEffect(() => {
    if (!detail) {
      setDetailStore(null);
      setDetailState("idle");
      return;
    }
    const controller = new AbortController();
    setDetailStore(null);
    setDetailState("loading");
    fetch(`/api/showrooms/public/${encodeURIComponent(detail.slug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load store");
        return response.json() as Promise<Store>;
      })
      .then((store) => {
        setDetailStore(store);
        setDetailState("idle");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDetailState("error");
      });
    return () => controller.abort();
  }, [detail]);
  const change = (p: Partial<Filters>) => {
    setVisibleCount(24);
    setF((x) => ({ ...x, ...p }));
    setSelected("");
  };
  const open = (id: string) => {
    savedSheet.current = sheet;
    setSelected(id);
    setPick([]);
    setCollapsed(false);
    setSheet(100);
  };
  const close = () => {
    setSelected("");
    setSheet(savedSheet.current);
    requestAnimationFrame(() =>
      document
        .getElementById(`store-${selected}`)
        ?.focus({ preventScroll: true }),
    );
  };
  const world = () => {
    change({ q: "", country: "", city: "", bounds: undefined });
    setCommand((c) => ({ id: c.id + 1, kind: "world" }));
  };
  const reset = () => {
    setVisibleCount(24);
    setF({
      q: "",
      brand: "",
      model: "",
      confirmed: false,
      appointment: "",
      type: "",
    });
    setSelected("");
  };
  const cities = Array.from(
    new Set(results.map((s) => `${s.city}, ${s.country_code}`)),
  );
  return (
    <div className="atlas">
      <AtlasHeader />
      {/*
      <header className="atlas-header">
        <Link href="/" className="atlas-wordmark">
          Chairpedia
        </Link>
        <span>Showrooms</span>
        <Link href="/stores/locations">Browse locations</Link>
        <Link href="/products">Explore chairs ↗</Link>
      </header>
      */}
      <div className="atlas-search">
        <div className="atlas-intro">
          <p className="atlas-kicker">Find your chair. Try it in person.</p>
          <h1>Showrooms around the world</h1>
        </div>
        <label className="atlas-country">
          <span className="sr-only">Country</span>
          <select aria-label="Country" value={f.country || ""} onChange={(e) => {
            change({ country: e.target.value, city: "", q: "", bounds: undefined });
            setCommand((c) => ({ id: c.id + 1, kind: "fit" }));
          }}>
            <option value="">All countries</option>
            {Array.from(new Set(stores.map(s => s.country_code))).sort().map(code => <option key={code} value={code}>{new Intl.DisplayNames(["en"], { type: "region" }).of(code)}</option>)}
          </select>
        </label>
        <label className="atlas-searchbox">
          <span className="sr-only">
            Search registered cities, countries and stores
          </span>
          <input
            value={f.q}
            placeholder="City or store name"
            onChange={(e) => change({ q: e.target.value, city: "", bounds: undefined })}
          />
        </label>
        <button className="atlas-filter-toggle" aria-expanded={filters} onClick={() => setFilters(!filters)}>
          Filters {filters ? "−" : "+"}
        </button>
      </div>
      {filters && (
        <section className="atlas-filters" onKeyDown={(e) => { if(e.key === "Escape") setFilters(false); }} aria-label="Store filters">
          <label>
            Brand
            <select
              aria-label="Brand"
              value={f.brand}
              onChange={(e) =>
                change({ brand: e.target.value, model: "", confirmed: false })
              }
            >
              <option value="">All brands</option>
              {catalog.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chair model
            <select
              aria-label="Chair model"
              value={f.model}
              onChange={(e) =>
                change({ model: e.target.value, confirmed: false })
              }
            >
              <option value="">All models</option>
              {catalog.models
                .filter((m) => !f.brand || m.brand_id === f.brand)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Visit
            <select
              aria-label="Visit"
              value={f.appointment}
              onChange={(e) => change({ appointment: e.target.value })}
            >
              <option value="">Any arrangement</option>
              <option value="walk_in">Walk-in</option>
              <option value="required">Appointment required</option>
              <option value="unknown">Unconfirmed</option>
            </select>
          </label>
          <label className="atlas-check">
            <input
              type="checkbox"
              disabled={!f.model}
              checked={f.confirmed}
              onChange={(e) => change({ confirmed: e.target.checked })}
            />
            Selected model confirmed to try only
          </label>
          <button onClick={reset}>Reset filters</button>
          <button onClick={() => setFilters(false)}>Done</button>
        </section>
      )}
      <div className="atlas-toolbar">
        <div>
          <strong>{f.bounds ? "This map area" : f.q || (f.country ? new Intl.DisplayNames(["en"], { type: "region" }).of(f.country) : "Worldwide")}</strong>{" "}
          <span>
            {cities.length} cities · {results.length} stores
          </span>
        </div>
        <div>
          <button onClick={world}>World view</button>
          <button
            disabled={!results.length}
            onClick={() => setCommand((c) => ({ id: c.id + 1, kind: "fit" }))}
          >
            Fit results
          </button>
        </div>
      </div>
      {f.city && <p className="atlas-model-note">City: {stores.find(s => s.country_code === f.country && cityKey(s) === f.city)?.city || f.city}. <button onClick={() => { change({ city: "" }); setCommand(c => ({ id: c.id + 1, kind: "fit" })); }}>Show entire country</button></p>}
      {model && (
        <p className="atlas-model-note">
          {model.name}: confirmed trial locations first; brand-only stores
          require confirmation.{" "}
          <button onClick={() => change({ model: "", confirmed: false })}>
            Clear model
          </button>
        </p>
      )}
      <div
        ref={stage}
        className={`atlas-stage ${collapsed ? "atlas-collapsed" : ""} ${dragging ? "atlas-dragging" : ""}`}
        style={{ "--sheet": `${sheet}%` } as React.CSSProperties}
      >
        <div className="atlas-map-slot">
          <AtlasMap
            stores={results}
            selected={selected}
            onSelect={(ids) => (ids.length === 1 ? open(ids[0]) : setPick(ids))}
            onArea={(bounds) => change({ bounds, q: "" })}
            command={command}
          />
        </div>
        {collapsed && (
          <button className="atlas-expand" onClick={() => setCollapsed(false)}>
            Show list
          </button>
        )}
        <aside className={`atlas-panel ${sheet <= 12 ? "atlas-peek" : ""}`} aria-label="Store results">
          <button
            ref={handle}
            className="atlas-sheet-handle"
            aria-label="Resize results panel"
            onClick={(e) => {
              if (e.detail === 0)
                setSheet((s) => (s < 30 ? 48 : s < 80 ? 100 : 12));
            }}
            onPointerDown={(e) => {
              if (!stage.current) return;
              drag.current = { y: e.clientY, height: sheet };
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
            }}
            onPointerMove={(e) => {
              if (drag.current && stage.current) {
                const delta =
                  ((drag.current.y - e.clientY) / stage.current.clientHeight) *
                  100;
                setSheet(
                  Math.max(12, Math.min(100, drag.current.height + delta)),
                );
              }
            }}
            onPointerUp={(e) => {
              if (drag.current) {
                const distance = Math.abs(e.clientY - drag.current.y);
                drag.current = null;
                setDragging(false);
                setSheet((s) =>
                  distance < 5
                    ? s < 30
                      ? 48
                      : s < 80
                        ? 100
                        : 12
                    : [12, 48, 100].reduce((a, b) =>
                        Math.abs(a - s) < Math.abs(b - s) ? a : b,
                      ),
                );
              }
            }}
            onPointerCancel={() => {
              drag.current = null;
              setDragging(false);
            }}
          >
            ━━{" "}
            <span>
              Drag to resize
            </span>
          </button>
          <div className="atlas-panel-title">
            <div className="atlas-mobile-views"><button aria-pressed={sheet <= 12} onClick={() => { setSelected(""); setSheet(12); }}>Map</button><button aria-pressed={sheet === 100} onClick={() => setSheet(100)}>List</button></div>
            {detail ? (
              <button onClick={close}>← Back to results</button>
            ) : (
              <strong>{results.length} stores</strong>
            )}
            <button
              className="atlas-collapse"
              onClick={() => setCollapsed(true)}
            >
              Hide list ←
            </button>
          </div>
          <div
            className="atlas-results"
            style={{ display: detail ? "none" : undefined }}
          >
            {unavailable ? (
              <div className="atlas-empty">
                <h2>Store directory temporarily unavailable</h2>
                <p>Please try again later. Chair guides are still available.</p>
                <Link href="/products">Explore chairs ↗</Link>
              </div>
            ) : !results.length ? (
              <div className="atlas-empty">
                <p className="atlas-kicker">Keep exploring</p>
                <h2>
                  {stores.length
                    ? "No stores match yet"
                    : "Our showroom directory is taking shape"}
                </h2>
                <p>
                  {stores.length
                    ? "Try another area or remove a filter. We only show registered stores."
                    : "Verified locations will appear here. In the meantime, explore the chair database."}
                </p>
                {stores.length ? (
                  <>
                    <button onClick={reset}>Clear filters</button>
                    <button onClick={world}>Search worldwide</button>
                  </>
                ) : (
                  <Link href="/products">Explore chairs ↗</Link>
                )}
              </div>
            ) : (
              results.slice(0, visibleCount).map((s) => (
                <Link
                  id={`store-${s.id}`}
                  key={s.id}
                  href={`/stores/${s.slug}`}
                  className="atlas-store-card"
                  prefetch={false}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                      e.preventDefault();
                      open(s.id);
                    }
                  }}
                >
                  <p className="atlas-kicker">
                    {s.city} · {s.country_code}
                  </p>
                  <h2>{s.name}</h2>
                  <p>{s.address}</p>
                  <div className="atlas-tags">
                    <span>
                      {s.appointment === "required"
                        ? "Appointment"
                        : s.appointment === "walk_in"
                          ? "Walk-in"
                          : "Ask before visiting"}
                    </span>
                    {f.model && (
                      <span
                        className={
                          s.models.some(
                            (m) =>
                              m.product_id === f.model &&
                              m.trial === "confirmed",
                          )
                            ? "atlas-confirmed"
                            : ""
                        }
                      >
                        {s.models.some(
                          (m) =>
                            m.product_id === f.model && m.trial === "confirmed",
                        )
                          ? "Model confirmed to try"
                          : "Brand carried · ask first"}
                      </span>
                    )}
                  </div>
                  <p>
                    {s.brands
                      .filter((b) => b.carried === "confirmed")
                      .map((b) => b.name)
                      .join(" · ")}
                  </p>
                  <span>View store ↗</span>
                </Link>
              ))
            )}
          </div>
          {!detail && results.length > visibleCount && <button className="atlas-load-more" onClick={() => setVisibleCount(n => n + 24)}>Show more stores ({visibleCount} of {results.length})</button>}
          {detail && (
            <div className="atlas-detail-scroll">
              {detailState === "loading" && <p className="atlas-detail-status" role="status">Loading store details…</p>}
              {detailState === "error" && <p className="atlas-detail-status" role="alert">Store details could not be loaded. Open the full page below.</p>}
              {detailStore && <StoreDetails key={detailStore.id} store={detailStore} correctionsEnabled={correctionsEnabled} />}
              <Link href={`/stores/${detail.slug}`}>
                Open shareable store page ↗
              </Link>
            </div>
          )}
        </aside>
        {pick.length > 0 && (
          <div
            className="atlas-picker"
            role="dialog"
            aria-label="Stores at this location"
          >
            <h2>Choose a store</h2>
            {pick.map((id) => (
              <button key={id} onClick={() => open(id)}>
                {stores.find((s) => s.id === id)?.name}
              </button>
            ))}
            <button onClick={() => setPick([])}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
