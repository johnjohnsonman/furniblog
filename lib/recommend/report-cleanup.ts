import { createAdminClient } from "@/lib/supabase/admin"
import { downloadSharedReport } from "./report-storage"
import { reportBucket, sharedReportSchema } from "./shared-report"
export async function cleanupSharedReports(dryRun = false) {
  const bucket=createAdminClient().storage.from(reportBucket), now=Date.now()
  const pending:string[]=[]
  // Collect before deleting so pagination offsets cannot skip records.
  for(let offset=0;offset<5000;offset+=100){
    const {data,error}=await bucket.list('reports',{limit:100,offset,sortBy:{column:'created_at',order:'asc'}})
    if(error)throw error
    for(const file of data??[]){
      if(!/^[a-f0-9-]{36}\.json$/.test(file.name))continue
      const parsed=sharedReportSchema.safeParse(await downloadSharedReport(file.name.slice(0,-5)))
      if(parsed.success&&Date.parse(parsed.data.expiresAt)<=now)pending.push(`reports/${file.name}`)
    }
    if(!data||data.length<100)break
  }
  const {data:folders,error}=await bucket.list('limits',{limit:1000,sortBy:{column:'name',order:'asc'}})
  if(error)throw error
  for(const folder of folders??[]){
    if(!/^\d+$/.test(folder.name)||Number(folder.name)>=Math.floor(now/3600000)-24)continue
    for(let offset=0;offset<5000;offset+=100){
      const {data,error}=await bucket.list(`limits/${folder.name}`,{limit:100,offset,sortBy:{column:'name',order:'asc'}})
      if(error)throw error
      for(const file of data??[])if(/^[a-f0-9]{64}-[0-4]\.json$/.test(file.name))pending.push(`limits/${folder.name}/${file.name}`)
      if(!data||data.length<100)break
    }
  }
  if(!dryRun)for(let i=0;i<pending.length;i+=100){const{error}=await bucket.remove(pending.slice(i,i+100));if(error)throw error}
  return {dryRun,reports:pending.filter(x=>x.startsWith('reports/')).length,rateMarkers:pending.filter(x=>x.startsWith('limits/')).length}
}
