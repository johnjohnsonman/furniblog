import { z } from "zod"
import { evaluateProductFit, type FitSpecs } from "./fit"

const measurement = z.number().positive().lt(1000).nullable()
export const configurationSchema = z.object({
  id: z.string().uuid(), product_id: z.string().uuid(),
  market_code: z.string().regex(/^[A-Z]{2}$/), status: z.literal("verified"),
  label: z.string(), configuration_key: z.string(),
  seat_height_min: measurement, seat_height_max: measurement,
  seat_depth_min: measurement, seat_depth_max: measurement, seat_depth_fixed: measurement,
  seat_width: measurement, weight_capacity: measurement,
  armrest_floor_height_min: measurement, armrest_floor_height_max: measurement,
  source_title: z.string(), source_url: z.string().url().regex(/^https?:\/\//), checked_on: z.string(), notes: z.string(),
}).superRefine((r,ctx)=>{
  for(const [min,max] of [[r.seat_height_min,r.seat_height_max],[r.seat_depth_min,r.seat_depth_max],[r.armrest_floor_height_min,r.armrest_floor_height_max]]) {
    if((min===null)!==(max===null)||(min!==null&&max!==null&&min>max)) ctx.addIssue({code:'custom',message:'Invalid range'});
  }
  if(r.seat_depth_fixed!==null&&r.seat_depth_min!==null) ctx.addIssue({code:'custom',message:'Conflicting depth types'});
})
export const configurationRequestSchema = z.object({
  configurationId: z.string().uuid(),
  market: z.string().regex(/^[A-Za-z]{2}$/).transform(v=>v.toUpperCase()),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250).optional(),
  deskHeightCm: z.number().min(45).max(140).optional(),
  armrestsUnderDesk: z.boolean().optional(),
}).strict()

export function evaluateConfiguration(raw: unknown, input: z.infer<typeof configurationRequestSchema>) {
  const row = configurationSchema.parse(raw)
  if(row.id!==input.configurationId || row.market_code!==input.market) throw new Error('Configuration selection mismatch')
  // Construct a new specification. Never backfill unknowns from product-wide or other option values.
  const specs: FitSpecs = {
    seatHeightMin: row.seat_height_min ?? undefined, seatHeightMax: row.seat_height_max ?? undefined,
    seatDepthMin: row.seat_depth_min ?? undefined, seatDepthMax: row.seat_depth_max ?? undefined,
    seatDepth: row.seat_depth_fixed ?? undefined, seatWidth: row.seat_width ?? undefined,
    weightCapacityKg: row.weight_capacity ?? undefined,
    armrestFloorHeightMin: row.armrest_floor_height_min ?? undefined,
    armrestFloorHeightMax: row.armrest_floor_height_max ?? undefined,
  }
  return { configuration: row, fit: evaluateProductFit(input, specs) }
}
