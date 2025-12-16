import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/60">Welcome to the Nemo UndervaluedAI control center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Holdings Card */}
         <Link href="/admin/holdings" className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
             <div className="mb-2 text-emerald-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h3 className="text-lg font-bold mb-1 group-hover:text-emerald-400 transition">Manage Holdings</h3>
             <p className="text-sm text-white/50">Update portfolio weights, add new positions, and write rationales.</p>
         </Link>

         {/* Trades Card */}
         <Link href="/admin/trades" className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
             <div className="mb-2 text-blue-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
             </div>
             <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition">Manage Trades</h3>
             <p className="text-sm text-white/50">Log buys and sells, set execution prices, and add trade notes.</p>
         </Link>

         {/* Funds Card */}
         <div className="rounded-xl border border-white/5 bg-white/5 p-6 opacity-50 cursor-not-allowed">
             <div className="mb-2 text-white/30">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </div>
             <h3 className="text-lg font-bold mb-1">Fund Specs</h3>
             <p className="text-sm text-white/30">Edit fund details, benchmarks, and strategies (Coming Soon).</p>
         </div>
      </div>
    </div>
  );
}
