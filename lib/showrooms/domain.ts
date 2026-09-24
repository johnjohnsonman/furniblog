import type { Store, StorePreview, Hours, Period, Catalog } from "./types";
import { discoveryOrder } from "./discovery-order";
import { cityKey } from "./locations";

export function resolveStoreModel(value: string, models: Catalog["models"]): string {
  if (!value) return "";
  return models.find(model => model.id === value || model.slug === value)?.id ?? "";
}

export function httpUrl(value: string) {
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function wrapLongitude(x: number) {
  return ((((x + 180) % 360) + 360) % 360) - 180;
}
export function inBounds(
  lat: number,
  lng: number,
  b: [number, number, number, number],
) {
  if (lat < b[1] || lat > b[3]) return false;
  if (Math.abs(b[2] - b[0]) >= 360) return true;
  const w = wrapLongitude(b[0]),
    e = wrapLongitude(b[2]),
    x = wrapLongitude(lng);
  return w <= e ? x >= w && x <= e : x >= w || x <= e;
}
export function compactBounds(
  points: [number, number][],
): [[number, number], [number, number]] | null {
  if (!points.length) return null;
  const longs = points
    .map((p) => (wrapLongitude(p[0]) + 360) % 360)
    .sort((a, b) => a - b);
  let gap = -1,
    start = longs[0];
  for (let i = 0; i < longs.length; i++) {
    const next = i === longs.length - 1 ? longs[0] + 360 : longs[i + 1];
    if (next - longs[i] > gap) {
      gap = next - longs[i];
      start = next % 360;
    }
  }
  const xs = longs.map((x) => (x < start ? x + 360 : x)),
    ys = points.map((p) => p[1]);
  return [
    [Math.min(...xs), Math.min(...ys)],
    [Math.max(...xs), Math.max(...ys)],
  ];
}
const minute = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
export function hoursState(
  hours: Hours,
  timezone: string,
  now = new Date(),
): {
  state: "open" | "closed" | "unknown";
  today: Period[] | null;
  date: string;
} {
  try {
    if (!timezone) throw new Error();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (s: string) => parts.find((p) => p.type === s)!.value;
    const date = `${get("year")}-${get("month")}-${get("day")}`,
      day = new Date(date + "T12:00:00Z").getUTCDay();
    const prevDate = new Date(
      new Date(date + "T12:00:00Z").getTime() - 86400000,
    )
      .toISOString()
      .slice(0, 10);
    const today = Object.hasOwn(hours.exceptions, date)
      ? hours.exceptions[date]
      : (hours.weekly[String(day)] ?? null);
    const prev = Object.hasOwn(hours.exceptions, prevDate)
      ? hours.exceptions[prevDate]
      : (hours.weekly[String((day + 6) % 7)] ?? null);
    const m = Number(get("hour")) * 60 + Number(get("minute"));
    // An explicit date exception overrides overnight carry from the previous day.
    const carries = !Object.hasOwn(hours.exceptions, date);
    const open =
      today?.some((p) =>
        minute(p.close) > minute(p.open)
          ? m >= minute(p.open) && m < minute(p.close)
          : m >= minute(p.open),
      ) ||
      (carries &&
        prev?.some(
          (p) => minute(p.close) <= minute(p.open) && m < minute(p.close),
        ));
    return {
      state: open
        ? "open"
        : today === null || (carries && prev === null)
          ? "unknown"
          : "closed",
      today,
      date,
    };
  } catch {
    return { state: "unknown", today: null, date: "" };
  }
}
export type Filters = {
  country?: string;
  city?: string;
  q: string;
  brand: string;
  model: string;
  confirmed: boolean;
  appointment: string;
  type: string;
  bounds?: [number, number, number, number];
};
export function filterStores(
  stores: StorePreview[],
  f: Filters,
  catalogModelBrand?: string,
) {
  const q = f.q.trim().toLocaleLowerCase("en");
  const country = (code: string) => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
    } catch {
      return code;
    }
  };
  const filtered = stores
    .filter(
      (s) =>
        s.status === "published" &&
        (!f.country || s.country_code === f.country) &&
        (!f.city || cityKey(s) === f.city) &&
        (!q ||
          [
            s.name,
            s.city,
            s.region,
            s.country_code,
            country(s.country_code),
            s.address,
          ]
            .join(" ")
            .toLocaleLowerCase("en")
            .includes(q)) &&
        (!f.brand ||
          s.brands.some(
            (b) => b.brand_id === f.brand && b.carried === "confirmed",
          )) &&
        (!f.model ||
          s.models.some(
            (m) => m.product_id === f.model && m.trial === "confirmed",
          ) ||
          (!f.confirmed &&
            !s.models.some(
              (m) => m.product_id === f.model && m.trial === "unavailable",
            ) &&
            s.brands.some(
              (b) =>
                b.brand_id === catalogModelBrand && b.carried === "confirmed",
            ))) &&
        (!f.confirmed ||
          (!!f.model &&
            s.models.some(
              (m) => m.product_id === f.model && m.trial === "confirmed",
            ))) &&
        (!f.appointment || s.appointment === f.appointment) &&
        (!f.type ||
          (f.type === "dealer"
            ? s.brands.some(
                (b) =>
                  b.official === "confirmed" &&
                  (!f.brand || b.brand_id === f.brand),
              )
            : s.store_type === f.type)) &&
        (!f.bounds ||
          (s.latitude !== null &&
            s.longitude !== null &&
            inBounds(s.latitude, s.longitude, f.bounds))),
    )
    .sort(
      (a, b) =>
        Number(
          b.models.some(
            (m) => m.product_id === f.model && m.trial === "confirmed",
          ),
        ) -
          Number(
            a.models.some(
              (m) => m.product_id === f.model && m.trial === "confirmed",
            ),
          ) || a.name.localeCompare(b.name, "en") || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );
  const unfiltered = !q && !f.country && !f.city && !f.brand && !f.model && !f.confirmed && !f.appointment && !f.type && !f.bounds;
  return unfiltered ? discoveryOrder(filtered) : filtered;
}
export function contactLinks(s: Store) {
  return [
    s.latitude !== null && s.longitude !== null
      ? {
          kind: "directions",
          label: "Directions",
          href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${s.latitude},${s.longitude}`)}`,
        }
      : null,
    s.phone
      ? {
          kind: "phone",
          label: "Call",
          href: `tel:${s.phone.replace(/[^+0-9]/g, "")}`,
        }
      : null,
    s.email
      ? { kind: "email", label: "Email", href: `mailto:${s.email}` }
      : null,
    httpUrl(s.website_url)
      ? {
          kind: "website",
          label: "Official website",
          href: httpUrl(s.website_url)!,
        }
      : null,
    httpUrl(s.booking_url)
      ? {
          kind: "booking",
          label: "Book externally",
          href: httpUrl(s.booking_url)!,
        }
      : null,
  ].filter((x): x is { kind: string; label: string; href: string } => !!x);
}
