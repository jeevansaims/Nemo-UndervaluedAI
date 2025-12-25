'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface AllocationData {
  name: string;
  value: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

interface AllocationChartsProps {
  sectorAllocation?: Record<string, number>;
  geoAllocation?: Record<string, number>;
  marketCapAllocation?: Record<string, number>;
}

const COLORS = {
  sector: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'],
  geo: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  marketCap: ['#10b981', '#3b82f6', '#8b5cf6'],
};

export default function AllocationCharts({ sectorAllocation, geoAllocation, marketCapAllocation }: AllocationChartsProps) {
  // Convert allocation objects to array format for charts
  const sectorData: AllocationData[] = sectorAllocation 
    ? Object.entries(sectorAllocation).map(([name, value]) => ({ name, value }))
    : [];

  const geoData: AllocationData[] = geoAllocation
    ? Object.entries(geoAllocation).map(([name, value]) => ({ name, value }))
    : [];

  const marketCapData: AllocationData[] = marketCapAllocation
    ? Object.entries(marketCapAllocation).map(([name, value]) => ({ name, value }))
    : [];

  if (!sectorAllocation && !geoAllocation && !marketCapAllocation) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Sector Allocation */}
      {sectorAllocation && (
        <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
          <h3 className="text-xl font-bold mb-4">Sector Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.sector[index % COLORS.sector.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sectorData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white/60">{item.name}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geographic Allocation */}
      {geoAllocation && (
        <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
          <h3 className="text-xl font-bold mb-4">Geographic Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={geoData} layout="horizontal">
              <XAxis type="number" stroke="#ffffff40" />
              <YAxis type="category" dataKey="name" stroke="#ffffff40" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {geoData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white/60">{item.name}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Cap Allocation */}
      {marketCapAllocation && (
        <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
          <h3 className="text-xl font-bold mb-4">Market-Cap Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={marketCapData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}\n${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marketCapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.marketCap[index % COLORS.marketCap.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#232323', border: '1px solid #404040', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {marketCapData.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white/60">{item.name}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
