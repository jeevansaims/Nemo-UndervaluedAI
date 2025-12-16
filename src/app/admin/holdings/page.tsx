"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminHoldingsPage() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
      ticker: "",
      name: "",
      weightPct: "0",
      bucket: "SMALL",
      rationale: ""
  });

  const fetchHoldings = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/holdings");
      if (res.ok) {
          const data = await res.json();
          setHoldings(data.holdings);
      }
      setLoading(false);
  };

  useEffect(() => {
      fetchHoldings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch("/api/admin/holdings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
      });
      setFormData({ ...formData, ticker: "", weightPct: "0", rationale: "" });
      fetchHoldings();
  };

  const handleDelete = async (ticker: string) => {
      if(!confirm("Delete holding?")) return;
      await fetch(`/api/admin/holdings?ticker=${ticker}`, { method: "DELETE" });
      fetchHoldings();
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Manage Holdings</h1>
            <Link href="/admin" className="text-sm text-white/50 hover:text-white">Dashboard</Link>
        </div>

        {/* Add Form */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8">
            <h3 className="font-semibold mb-3">Upsert Holding</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <input 
                 placeholder="Ticker (e.g. AAPL)" 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.ticker}
                 onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                 required
               />
               <input 
                 placeholder="Weight %" 
                 type="number" step="0.01"
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.weightPct}
                 onChange={e => setFormData({...formData, weightPct: e.target.value})}
               />
               <select 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.bucket}
                 onChange={e => setFormData({...formData, bucket: e.target.value})}
               >
                   <option value="SMALL">SMALL</option>
                   <option value="MED">MED</option>
                   <option value="LARGE">LARGE</option>
               </select>
               <input 
                 placeholder="Rationale" 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm md:col-span-4"
                 value={formData.rationale}
                 onChange={e => setFormData({...formData, rationale: e.target.value})}
               />
               <div className="md:col-span-4 text-right">
                   <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-4 rounded text-sm">
                       Save Holding
                   </button>
               </div>
            </form>
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="text-white/40 bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="p-4">Ticker</th>
                        <th className="p-4">Weight</th>
                        <th className="p-4">Rationale</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td className="p-4 text-center text-white/30" colSpan={4}>Loading...</td></tr>
                    ) : (
                        holdings.map((h: any) => (
                            <tr key={h.id}>
                                <td className="p-4 font-bold">{h.ticker}</td>
                                <td className="p-4">{h.weightPct}% <span className="text-xs text-white/30 ml-2">({h.bucket})</span></td>
                                <td className="p-4 text-white/60 truncate max-w-xs" title={h.rationale}>{h.rationale}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(h.ticker)} className="text-rose-400 hover:text-rose-300 text-xs">Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
