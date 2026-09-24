import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { filterShowroomLinks, showroomsEnabled } from "../lib/navigation/showrooms"

const navigation = [
  { name: "Chairs", href: "/products" },
  { name: "Find Stores", href: "/stores" },
  { name: "Guides", href: "/chairpedia" },
]

assert.equal(showroomsEnabled("true"), true)
assert.equal(showroomsEnabled("false"), false)
assert.equal(showroomsEnabled(undefined), false)
assert.deepEqual(filterShowroomLinks(navigation, true), navigation)
assert.deepEqual(filterShowroomLinks(navigation, false), [navigation[0], navigation[2]])

const header = readFileSync(resolve("components/header.tsx"), "utf8")
const client = readFileSync(resolve("components/header-client.tsx"), "utf8")
const footer = readFileSync(resolve("components/footer.tsx"), "utf8")
assert.match(header, /showStores=\{showroomsEnabled\(\)\}/)
assert.equal((client.match(/visibleMainNav\.map/g) ?? []).length, 2, "desktop and mobile must share filtered navigation")
assert.doesNotMatch(client, /mainNav\.map/, "unfiltered showroom navigation remains")
assert.equal((footer.match(/showStores && <li>/g) ?? []).length, 2, "footer showroom links must follow the flag")

console.log("showroom navigation tests passed")
