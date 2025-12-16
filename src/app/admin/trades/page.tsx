"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
      ticker: "",
      action: "BUY",
      date: new Date().toISOString().split("T")[0],
      qty: "",
      price: "",
      rationale: ""
  });

  const fetchTrades = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/trades");
      if (res.ok) {
          const data = await res.json();
          setTrades(data.trades);
      }
      setLoading(false);
  };

  useEffect(() => {
      fetchTrades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch("/api/admin/trades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
      });
      // reset logic
      setFormData({ ...formData, ticker: "", qty: "", price: "", rationale: "" });
      fetchTrades();
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete trade?")) return;
      await fetch(`/api/admin/trades?id=${id}`, { method: "DELETE" });
      fetchTrades();
  };

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Manage Trades</h1>
             <Link href="/admin" className="text-sm text-white/50 hover:text-white">Dashboard</Link>
        </div>

        {/* Add Form */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8">
            <h3 className="font-semibold mb-3">Log Trade</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <input 
                 type="date"
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.date}
                 onChange={e => setFormData({...formData, date: e.target.value})}
                 required
               />
               <input 
                 placeholder="Ticker" 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.ticker}
                 onChange={e => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                 required
               />
               <select 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.action}
                 onChange={e => setFormData({...formData, action: e.target.value})}
               >
                   <option value="BUY">BUY</option>
                   <option value="SELL">SELL</option>
               </select>
               <input 
                 placeholder="Price ($)" 
                 type="number" step="0.01"
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
                 value={formData.price}
                 onChange={e => setFormData({...formData, price: e.target.value})}
               />
               <input 
                 placeholder="Rationale" 
                 className="bg-black/20 border border-white/10 rounded px-3 py-2 text-sm md:col-span-4"
                 value={formData.rationale}
                 onChange={e => setFormData({...formData, rationale: e.target.value})}
               />
               <div className="md:col-span-4 text-right">
                   <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-4 rounded text-sm">
                       Log Trade
                   </button>
               </div>
            </form>
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="text-white/40 bg-white/5 border-b border-white/10">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Ticker</th>
                        <th className="p-4">Price</th>
                         <th className="p-4">Rationale</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td className="p-4 text-center text-white/30" colSpan={6}>Loading...</td></tr>
                    ) : (
                        trades.map((t: any) => (
                            <tr key={t.id}>
                                <td className="p-4 text-white/60">{new Date(t.date).toLocaleDateString()}</td>
                                <td className={`p-4 font-bold ${t.action === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>{t.action}</td>
                                <td className="p-4 font-mono">{t.ticker}</td>
                                <td className="p-4">${t.price?.toFixed(2) ?? "—"}</td>
                                <td className="p-4 text-white/60 truncate max-w-xs">{t.rationale}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(t.id)} className="text-rose-400 hover:text-rose-300 text-xs">Delete</button>
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
