"use client";

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface PerformancePoint {
  date: string;
  value: number;
}

interface FundPerformanceChartProps {
  slug: string;
}

export default function FundPerformanceChart({ slug }: FundPerformanceChartProps) {
  const [data, setData] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState('1Y');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/funds/${slug}/performance?range=${range}`);
        if (!res.ok) throw new Error('Failed to fetch performance data');
        const json = await res.json();
        setData(json.performance);
      } catch (err) {
        console.error(err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, range]);

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-[#313131]/20 rounded-xl border border-[#404040]">
        <div className="animate-pulse text-white/40">Loading chart...</div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-[#313131]/20 rounded-xl border border-[#404040]">
        <div className="text-white/40">Chart unavailable</div>
      </div>
    );
  }

  // Calculate percentage change for domain
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const padding = (maxValue - minValue) * 0.1;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#232323] border border-[#404040] p-3 rounded-lg shadow-xl">
          <p className="text-white/60 text-xs mb-1">
            {new Date(label).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-emerald-400 font-bold text-lg">
            {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#313131]/10 rounded-xl border border-[#404040] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Performance History</h3>
        
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y', 'ALL'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                range === r 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short' })}
              minTickGap={50}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666" 
              domain={[minValue - padding, maxValue + padding]}
              tick={{ fontSize: 12 }}
              tickFormatter={(num) => num.toFixed(0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#34d399" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
