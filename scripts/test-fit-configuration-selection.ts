import assert from "node:assert/strict"
import { configurationRequestSchema, evaluateConfiguration } from "../lib/recommend/configurations"
const id = "00000000-0000-4000-8000-000000000001"
const row = { id, product_id: id, market_code: "US", status: "verified", label: "Test", configuration_key: "test",
  seat_height_min: 40.6, seat_height_max: 53.3, seat_depth_min: 40.6, seat_depth_max: 48.3,
  seat_depth_fixed: null, seat_width: 48.3, weight_capacity: 147.4,
  armrest_floor_height_min: null, armrest_floor_height_max: null,
  source_title: "Fixture", source_url: "https://example.com/spec", checked_on: "2026-09-20", notes: "Fixture only" }
const input = configurationRequestSchema.parse({ configurationId: id, market: "us", heightCm: 175, weightKg: 150, deskHeightCm: 72, armrestsUnderDesk: true })
const result = evaluateConfiguration(row,input)
assert.equal(result.fit.measurements.capacityKg,147.4)
assert.equal(result.fit.components.weightCapacity,0)
assert.equal(result.fit.measurements.armrestFloorHeightCm,null)
assert.equal(result.fit.components.deskClearance,null)
const other = evaluateConfiguration({...row,weight_capacity:158.8},input)
assert.ok((other.fit.components.weightCapacity ?? 0)>0)
assert.equal(evaluateConfiguration({...row,weight_capacity:null},input).fit.components.weightCapacity,null)
assert.throws(()=>evaluateConfiguration({...row,status:'draft'},input))
assert.throws(()=>evaluateConfiguration({...row,status:'retired'},input))
assert.throws(()=>evaluateConfiguration({...row,market_code:'KR'},input))
assert.throws(()=>evaluateConfiguration({...row,id:'00000000-0000-4000-8000-000000000002'},input))
assert.throws(()=>evaluateConfiguration({...row,seat_depth_fixed:42},input))
assert.throws(()=>evaluateConfiguration({...row,seat_height_min:60},input))
assert.throws(()=>configurationRequestSchema.parse({...input,heightCm:0}))
assert.throws(()=>configurationRequestSchema.parse({...input,market:''}))
console.log('PASS: exact market/configuration selection; draft and retired rejection; independent capacity; unknown clearance; invalid ranges and inputs')
