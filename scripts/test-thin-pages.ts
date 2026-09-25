import assert from "node:assert/strict"
import { isThinReview } from "../lib/seo/thin-pages"
import { SEARCH_CLICK_EXCEPTIONS } from "../lib/seo/search-click-exceptions"

const long = "x".repeat(260)
assert.equal(isThinReview({ id: "a", summary_ko: "short", pros: [], cons: [] }), true, "short with no pros/cons is thin")
assert.equal(isThinReview({ id: "b", summary_ko: "short", pros: ["good"], cons: [] }), false, "pros/cons make it substantive")
assert.equal(isThinReview({ id: "c", summary_ko: long, pros: [], cons: [] }), false, "long summary is not thin")
assert.equal(isThinReview({ id: "d", summary_ko: "User is asking which chair to buy " + long, pros: ["x"], cons: [] }), true, "question posts are thin")
const clicked = [...SEARCH_CLICK_EXCEPTIONS].find((p) => p.startsWith("/reviews/"))!.split("/").pop()!
assert.equal(isThinReview({ id: clicked, summary_ko: "short", pros: [], cons: [] }), false, "pages with search clicks are protected")
console.log("thin page tests passed")
