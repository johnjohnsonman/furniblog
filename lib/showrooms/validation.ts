import { z } from "zod";
import { httpUrl } from "./domain";
const text = z.string().trim().max(3000);
const url = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (s) => !s || !!httpUrl(s),
    "Use an http or https URL without credentials",
  );
const date = z
  .string()
  .refine(
    (s) =>
      !s ||
      (/^\d{4}-\d{2}-\d{2}$/.test(s) &&
        !isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s),
    "Invalid date",
  );
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const periods = z
  .array(z.object({ open: time, close: time }).strict())
  .max(6)
  .nullable();
const confirmation = z.enum(["confirmed", "unavailable", "unknown"]);
export const storeSchema = z
  .object({
    id: z.string().uuid().or(z.literal("")),
    slug: z
      .string()
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1).max(160),
    status: z.enum(["draft", "published", "private"]),
    country_code: z.string().regex(/^$|^[A-Z]{2}$/),
    city: text,
    region: text,
    address: text,
    unit: text,
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    timezone: z
      .string()
      .max(100)
      .refine((s) => {
        try {
          if (s) new Intl.DateTimeFormat("en", { timeZone: s });
          return true;
        } catch {
          return false;
        }
      }, "Invalid IANA timezone"),
    phone: z
      .string()
      .max(60)
      .refine(
        (s) => !s || (/^\+?[\d\s().-]{3,60}$/.test(s) && /\d{3}/.test(s.replace(/\D/g, ""))),
        "Invalid phone",
      ),
    email: z.string().email().or(z.literal("")),
    website_url: url,
    booking_url: url,
    store_type: z.enum(["brand_showroom", "retailer", "refurbisher"]),
    appointment: z.enum(["required", "walk_in", "unknown"]),
    hours: z
      .object({
        weekly: z.record(z.string().regex(/^[0-6]$/), periods),
        exceptions: z.record(date.refine(Boolean, "Date required"), periods),
      })
      .strict(),
    visit_notes: text,
    transport_notes: text,
    photos: z
      .array(
        z
          .object({
            url: url.refine(Boolean),
            credit: text.min(1),
            rights: text.min(1),
          })
          .strict(),
      )
      .max(12),
    source_url: url,
    checked_on: date,
    brands: z
      .array(
        z
          .object({
            brand_id: z.string().uuid(),
            carried: confirmation,
            official: confirmation,
            source_url: url,
            checked_on: date,
          })
          .strict(),
      )
      .max(100),
    models: z
      .array(
        z
          .object({
            product_id: z.string().uuid(),
            trial: confirmation,
            source_url: url,
            checked_on: date,
          })
          .strict(),
      )
      .max(200),
    updated_at: z.string().optional(),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (s.status === "published")
      for (const k of [
        "country_code",
        "city",
        "address",
        "source_url",
        "checked_on",
      ] as const)
        if (!s[k])
          ctx.addIssue({
            code: "custom",
            path: [k],
            message: "Required to publish",
          });
    if (
      s.status === "published" &&
      (s.latitude === null || s.longitude === null)
    )
      ctx.addIssue({
        code: "custom",
        path: ["latitude"],
        message: "Coordinates required to publish",
      });
    if (
      new Set(s.brands.map((b) => b.brand_id)).size !== s.brands.length ||
      new Set(s.models.map((m) => m.product_id)).size !== s.models.length
    )
      ctx.addIssue({ code: "custom", message: "Duplicate relationship" });
    s.brands.forEach((b, i) => {
      if (
        b.official === "confirmed" &&
        (b.carried !== "confirmed" || !b.source_url || !b.checked_on)
      )
        ctx.addIssue({
          code: "custom",
          path: ["brands", i],
          message: "Official dealer needs carried brand and dated evidence",
        });
    });
    s.models.forEach((m, i) => {
      if (m.trial !== "unknown" && (!m.source_url || !m.checked_on))
        ctx.addIssue({
          code: "custom",
          path: ["models", i],
          message: "Trial decision needs dated evidence",
        });
    });
  });
