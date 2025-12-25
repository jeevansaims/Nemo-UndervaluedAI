'use client';

interface AllocationBarsProps {
  sectorAllocation?: Record<string, number>;
  geoAllocation?: Record<string, number>;
  marketCapAllocation?: Record<string, number>;
}

export default function AllocationBars({ 
  sectorAllocation, 
  geoAllocation, 
  marketCapAllocation 
}: AllocationBarsProps) {
  if (!sectorAllocation && !geoAllocation && !marketCapAllocation) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Sector Allocation */}
      {sectorAllocation && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
          <div className="space-y-3">
            {Object.entries(sectorAllocation)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([sector, percentage]) => (
                <div key={sector} className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-32 truncate">{sector}</span>
                  <div className="flex-1 bg-[#404040] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Geographic Allocation */}
      {geoAllocation && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Geographic Allocation</h3>
          <div className="space-y-3">
            {Object.entries(geoAllocation)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, percentage]) => (
                <div key={country} className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-32 truncate">{country}</span>
                  <div className="flex-1 bg-[#404040] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Market-Cap Allocation */}
      {marketCapAllocation && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Market-Cap Allocation</h3>
          <div className="space-y-3">
            {Object.entries(marketCapAllocation)
              .sort(([, a], [, b]) => b - a)
              .map(([cap, percentage]) => (
                <div key={cap} className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-32">{cap}</span>
                  <div className="flex-1 bg-[#404040] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
