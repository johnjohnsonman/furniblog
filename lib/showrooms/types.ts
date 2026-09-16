export type Confirmation = "confirmed" | "unavailable" | "unknown";
export type Period = { open: string; close: string };
export type Hours = {
  weekly: Record<string, Period[] | null>;
  exceptions: Record<string, Period[] | null>;
};
export type StoreBrand = {
  brand_id: string;
  name?: string;
  slug?: string;
  carried: Confirmation;
  official: Confirmation;
  source_url: string;
  checked_on: string;
};
export type StoreModel = {
  product_id: string;
  name?: string;
  slug?: string;
  brand_id?: string;
  trial: Confirmation;
  source_url: string;
  checked_on: string;
};
export type Store = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published" | "private";
  country_code: string;
  city: string;
  region: string;
  address: string;
  unit: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  phone: string;
  email: string;
  website_url: string;
  booking_url: string;
  store_type: "brand_showroom" | "retailer" | "refurbisher";
  appointment: "required" | "walk_in" | "unknown";
  hours: Hours;
  visit_notes: string;
  transport_notes: string;
  photos: { url: string; credit: string; rights: string }[];
  source_url: string;
  checked_on: string;
  brands: StoreBrand[];
  models: StoreModel[];
  updated_at?: string;
};
export type Catalog = {
  brands: { id: string; name: string; slug: string }[];
  models: { id: string; name: string; slug: string; brand_id: string }[];
};
export const emptyStore: Store = {
  id: "",
  slug: "",
  name: "",
  status: "draft",
  country_code: "",
  city: "",
  region: "",
  address: "",
  unit: "",
  latitude: null,
  longitude: null,
  timezone: "",
  phone: "",
  email: "",
  website_url: "",
  booking_url: "",
  store_type: "retailer",
  appointment: "unknown",
  hours: { weekly: {}, exceptions: {} },
  visit_notes: "",
  transport_notes: "",
  photos: [],
  source_url: "",
  checked_on: "",
  brands: [],
  models: [],
};
