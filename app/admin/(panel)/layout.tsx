import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authed = await isAdminAuthenticated()
  if (!authed) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster />
    </div>
  )
}
