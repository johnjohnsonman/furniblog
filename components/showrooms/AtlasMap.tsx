"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LibreMap, Marker } from "maplibre-gl";
import type { Store } from "@/lib/showrooms/types";
import { compactBounds, wrapLongitude } from "@/lib/showrooms/domain";
import "maplibre-gl/dist/maplibre-gl.css";
export type MapCommand = { id: number; kind: "world" | "fit" };
export function AtlasMap({
  stores,
  selected,
  onSelect,
  onArea,
  command,
}: {
  stores: Store[];
  selected: string;
  onSelect: (ids: string[]) => void;
  onArea: (b: [number, number, number, number]) => void;
  command: MapCommand;
}) {
  const host = useRef<HTMLDivElement>(null),
    map = useRef<LibreMap | null>(null),
    latest = useRef({ stores, selected, onSelect, onArea }),
    markers = useRef<Marker[]>([]);
  latest.current = { stores, selected, onSelect, onArea };
  const [retry, setRetry] = useState(0),
    [state, setState] = useState("loading"),
    [moved, setMoved] = useState(false),
    [ready, setReady] = useState(0);
  const paint = useRef<() => void>(() => {});
  useEffect(() => {
    let disposed = false,
      observer: ResizeObserver | undefined,
      frame = 0,
      timeout: ReturnType<typeof setTimeout> | undefined,
      m: LibreMap | undefined;
    setState("loading");
    setMoved(false);
    import("maplibre-gl")
      .then((lib) => {
        if (disposed || !host.current) return;
        lib.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        m = new lib.Map({
          container: host.current,
          style: "https://tiles.openfreemap.org/styles/positron",
          center: [10, 25],
          zoom: 1.5,
          maxZoom: 18,
          attributionControl: false,
          renderWorldCopies: true,
          // Avoid excessive GPU work on high-density displays.
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        });
        map.current = m;
        m.scrollZoom.setWheelZoomRate(1 / 300);
        m.scrollZoom.setZoomRate(1 / 80);
        m.on("style.load", () => {
          // The provider defaults to bilingual place labels. Public UI is English.
          for (const layer of m?.getStyle().layers ?? []) {
            if (
              layer.type === "symbol" &&
              JSON.stringify(layer.layout?.["text-field"] ?? "").includes("name")
            ) {
              m?.setLayoutProperty(layer.id, "text-field", [
                "coalesce",
                ["get", "name:en"],
                "",
              ]);
            }
          }
        });
        m.addControl(
          new lib.AttributionControl({ compact: false }),
          "bottom-right",
        );
        let lastW = -1,
          lastH = -1;
        // Each map instance owns its observer. Retry follows exactly the same path.
        observer = new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect;
          if (width === lastW && height === lastH) return;
          lastW = width;
          lastH = height;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            if (!disposed && m) {
              m.resize();
              paint.current();
            }
          });
        });
        observer.observe(host.current);
        paint.current = () => {
          if (!m || disposed) return;
          const compact = m.getZoom() < 9;
          const label = (stores: Store[]) => stores.length > 1 ? `${stores.length} stores` : compact ? "1 store" : stores[0].name;
          const groups: {
            x: number;
            y: number;
            lng: number;
            lat: number;
            stores: Store[];
          }[] = [];
          for (const s of latest.current.stores) {
            if (s.latitude === null || s.longitude === null) continue;
            const center = m.getCenter().lng;
            const lng =
              wrapLongitude(s.longitude) +
              360 * Math.round((center - wrapLongitude(s.longitude)) / 360);
            const p = m.project([lng, s.latitude]);
            if (
              p.x < -80 ||
              p.y < -80 ||
              p.x > m.getContainer().clientWidth + 80 ||
              p.y > m.getContainer().clientHeight + 80
            )
              continue;
            const g = groups.find((g) => Math.abs(g.x - p.x) < (compact ? 90 : 220) && Math.abs(g.y - p.y) < 50);
            if (g) g.stores.push(s);
            else
              groups.push({
                x: p.x,
                y: p.y,
                lng,
                lat: s.latitude,
                stores: [s],
              });
          }
          const previous = new Map(
            markers.current.map(marker => [marker.getElement().dataset.group, marker]),
          );
          const next: Marker[] = [];
          for (const g of groups) {
            const key = g.stores.map(s => s.id).sort().join(",");
            const existing = previous.get(key);
            if (existing) {
              previous.delete(key);
              existing.setLngLat([g.lng, g.lat]);
              existing.getElement().textContent = label(g.stores);
              existing.getElement().setAttribute("aria-label", g.stores.map(s => s.name).join(", "));
              existing.getElement().dataset.selected = String(g.stores.some(s => s.id === latest.current.selected));
              next.push(existing);
              continue;
            }
            const el = document.createElement("button");
            el.dataset.group = key;
            el.type = "button";
            el.className = "atlas-pin";
            el.textContent = label(g.stores);
            el.setAttribute(
              "aria-label",
              g.stores.map((s) => s.name).join(", "),
            );
            el.dataset.selected = String(
              g.stores.some((s) => s.id === latest.current.selected),
            );
            el.onclick = () => {
              if (!m) return;
              const same = g.stores.every(
                (s) =>
                  Math.abs((s.latitude ?? 0) - g.lat) < 0.00001 &&
                  Math.abs(wrapLongitude((s.longitude ?? 0) - g.lng)) < 0.00001,
              );
              if (g.stores.length === 1 || same || m.getZoom() >= 17) {
                latest.current.onSelect(g.stores.map((s) => s.id));
                return;
              }
              const b = compactBounds(
                g.stores.map((s) => [s.longitude!, s.latitude!]),
              );
              if (b)
                m.fitBounds(b, {
                  padding: 80,
                  maxZoom: Math.min(18, m.getZoom() + 3),
                  duration: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? 0
                    : 350,
                });
            };
            next.push(
              new lib.Marker({ element: el })
                .setLngLat([g.lng, g.lat])
                .addTo(m),
            );
          }
          previous.forEach(marker => marker.remove());
          markers.current = next;
        };
        m.on("moveend", () => paint.current());
        m.on("dragstart", () => {
          setMoved(true);
        });
        m.on("zoomstart", (e) => {
          if (e.originalEvent) {
            setMoved(true);
          }
        });
        m.on("load", () => {
          if (disposed) return;
          clearTimeout(timeout);
          setState("ready");
          setReady((n) => n + 1);
          paint.current();
        });
        m.on("error", () => {
          /* Individual tile errors may recover; initial load has a deadline. */
        });
        timeout = setTimeout(() => {
          if (!disposed) {
            setState("failed");
            observer?.disconnect();
            markers.current.forEach((x) => x.remove());
            markers.current = [];
            m?.remove();
            m = undefined;
            map.current = null;
          }
        }, 18000);
      })
      .catch(() => {
        if (!disposed) setState("failed");
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      markers.current.forEach((x) => x.remove());
      markers.current = [];
      m?.remove();
      map.current = null;
      paint.current = () => {};
    };
  }, [retry]);
  useEffect(() => {
    paint.current();
  }, [stores, selected]);
  useEffect(() => {
    const m = map.current;
    if (!m || state !== "ready" || command.id === 0) return;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 450;
    if (command.kind === "world")
      m.easeTo({ center: [10, 25], zoom: 1.5, duration });
    else {
      const b = compactBounds(
        latest.current.stores
          .filter((s) => s.longitude !== null && s.latitude !== null)
          .map((s) => [s.longitude!, s.latitude!]),
      );
      if (b) m.fitBounds(b, { padding: 65, maxZoom: 14, duration });
    }
    setMoved(false);
    // Only explicit commands or a newly created map move the camera, not selection/hover.
  }, [command, ready, state]);
  return (
    <div className="atlas-map">
      <div ref={host} className="atlas-map-canvas" aria-label="Store map" />
      {state === "loading" && (
        <p className="atlas-map-status" role="status">
          Loading map… You can browse the list.
        </p>
      )}
      {state === "failed" && (
        <div className="atlas-map-error" role="status">
          <h2>Map unavailable</h2>
          <p>The list, filters and store details still work.</p>
          <button onClick={() => setRetry((n) => n + 1)}>Retry map</button>
        </div>
      )}
      {state === "ready" && (
        <div className="atlas-map-tools">
          <button aria-label="Zoom in" onClick={() => { setMoved(true); map.current?.zoomIn({ duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160 }); }}>
            +
          </button>
          <button aria-label="Zoom out" onClick={() => { setMoved(true); map.current?.zoomOut({ duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160 }); }}>
            −
          </button>
        </div>
      )}
      {moved && state === "ready" && (
        <button
          className="atlas-area"
          onClick={() => {
            const b = map.current?.getBounds();
            if (b) {
              onArea([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
              setMoved(false);
            }
          }}
        >
          Search this area
        </button>
      )}
    </div>
  );
}
