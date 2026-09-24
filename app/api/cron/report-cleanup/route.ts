import { NextRequest,NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { cleanupSharedReports } from "@/lib/recommend/report-cleanup"
export const maxDuration=300
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET?.trim()
 if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`){const denied=requireAdmin(request);if(denied)return denied}
 try{return NextResponse.json(await cleanupSharedReports(request.nextUrl.searchParams.get('dryRun')==='true'),{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Report cleanup failed'},{status:500})}
}
