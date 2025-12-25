'use client';

interface FundMethodology {
  universe: string;
  selection: string;
  rebalancing: string;
}

interface FundMethodologyPanelProps {
  methodology: FundMethodology;
}

export default function FundMethodologyPanel({ methodology }: FundMethodologyPanelProps) {
  return (
    <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
      <h2 className="text-2xl font-bold mb-6">Fund Methodology</h2>
      
      <div className="space-y-6">
        {/* Universe */}
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-2">Universe</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {methodology.universe}
          </p>
        </div>

        {/* Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-2">Selection</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {methodology.selection}
          </p>
        </div>

        {/* Rebalancing */}
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-2">Rebalancing</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {methodology.rebalancing}
          </p>
        </div>
      </div>
    </div>
  );
}
