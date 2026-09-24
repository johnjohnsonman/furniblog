export function showroomsEnabled(value = process.env.SHOWROOMS_ENABLED): boolean {
  return value === "true"
}

export function filterShowroomLinks<T extends { href: string }>(items: readonly T[], enabled: boolean): T[] {
  return enabled ? [...items] : items.filter((item) => !item.href.startsWith("/stores"))
}
