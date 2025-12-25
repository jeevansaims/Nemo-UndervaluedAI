'use client';

import FundSidebarCard from './FundSidebarCard';

interface Fund {
  slug: string;
  name: string;
  description?: string;
  metrics: any;
  lastUpdated: Date;
}

interface FundSidebarProps {
  funds: Fund[];
  selectedFund: string;
  onSelectFund: (slug: string) => void;
}

export default function FundSidebar({ funds, selectedFund, onSelectFund }: FundSidebarProps) {
  return (
    <div className="w-80 border-r border-[#404040] overflow-y-auto bg-[#232323]">
      <div className="p-6 border-b border-[#404040]">
        <h1 className="text-2xl font-bold">AI Hedge Fund</h1>
        <p className="text-sm text-white/50 mt-1">Select a fund to view details</p>
      </div>
      
      <div>
        {funds.map((fund) => (
          <FundSidebarCard
            key={fund.slug}
            fund={fund}
            isSelected={selectedFund === fund.slug}
            onClick={() => onSelectFund(fund.slug)}
          />
        ))}
      </div>
    </div>
  );
}
