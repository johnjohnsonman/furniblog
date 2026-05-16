import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { designers } from "@/lib/data"

export default function DesignersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Designers
            </h1>
            <p className="mt-1 text-muted-foreground">
              {designers.length} legendary furniture designers
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Designer Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {designers.map((designer) => (
              <Link
                key={designer.id}
                href={`/designers/${designer.id}`}
                className="group flex items-start gap-4 p-5 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
              >
                <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-muted">
                  <img src={designer.image} alt={designer.name} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-foreground">
                      {designer.name}
                    </h2>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {designer.country} • b. {designer.born}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {designer.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {designer.notableWorks.slice(0, 2).map((work) => (
                      <span
                        key={work}
                        className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                      >
                        {work}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
