import { getServerRole } from "@/lib/auth/serverRole";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getServerRole();

  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
       {/* Admin Sidebar */}
       <aside className="w-64 border-r border-white/10 bg-neutral-900/50 p-6 flex flex-col gap-6">
          <div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                  Admin Panel
              </div>
              <Link href="/admin" className="text-xl font-bold tracking-tight text-white/90 hover:text-white">
                  Nemo<span className="text-emerald-500">Admin</span>
              </Link>
          </div>

          <nav className="flex flex-col gap-1">
              <Link href="/admin" className="px-3 py-2 text-sm rounded-md hover:bg-white/5 text-white/70 hover:text-white transition">
                  Dashboard
              </Link>
              <Link href="/admin/holdings" className="px-3 py-2 text-sm rounded-md hover:bg-white/5 text-white/70 hover:text-white transition">
                  Holdings
              </Link>
              <Link href="/admin/trades" className="px-3 py-2 text-sm rounded-md hover:bg-white/5 text-white/70 hover:text-white transition">
                  Trades
              </Link>
          </nav>
          
          <div className="mt-auto">
             <Link href="/" className="text-xs text-white/50 hover:text-white">
                 ← Back to App
             </Link>
          </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 overflow-y-auto">
           <header className="border-b border-white/5 bg-neutral-900/30 p-4 px-8 sticky top-0 backdrop-blur z-10">
               <div className="font-mono text-xs text-white/30">
                   Admin Mode • {new Date().toLocaleDateString()}
               </div>
           </header>
           <div className="p-8 max-w-5xl mx-auto">
               {children}
           </div>
       </main>
    </div>
  );
}
