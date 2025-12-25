'use client';

import { useState, useEffect } from 'react';

interface FundData {
  id: string;
  slug: string;
  name: string;
  description: string;
  methodology?: any;
  holdings: any[];
  currentValue: number;
  metrics: any;
  lastUpdated: Date;
  sectorAllocation?: Record<string, number>;
  geoAllocation?: Record<string, number>;
  marketCapAllocation?: Record<string, number>;
}

export function useFundData(slug: string) {
  const [fund, setFund] = useState<FundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    fetch(`/api/funds/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch fund');
        return res.json();
      })
      .then((data) => {
        setFund(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  return { fund, loading, error };
}
