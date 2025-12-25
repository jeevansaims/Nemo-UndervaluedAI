'use client';

import { useState, useEffect } from 'react';
import { Wallet, Check, X, Loader2, ExternalLink, AlertCircle } from 'lucide-react';

interface BrokerStatus {
  connected: boolean;
  broker?: string;
  paperTrading?: boolean;
  account?: {
    accountNumber: string;
    status: string;
    currency: string;
    cash: number;
    portfolioValue: number;
    buyingPower: number;
    equity: number;
  };
  positionCount?: number;
  error?: string;
}

export default function BrokerConnectionCard() {
  const [status, setStatus] = useState<BrokerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [paperTrading, setPaperTrading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/broker/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to fetch broker status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setError(null);

    try {
      const res = await fetch('/api/broker/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker: 'alpaca',
          apiKey,
          apiSecret,
          paperTrading,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      setShowConnectModal(false);
      setApiKey('');
      setApiSecret('');
      fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your broker?')) return;

    try {
      await fetch('/api/broker/disconnect', { method: 'DELETE' });
      fetchStatus();
    } catch (e) {
      console.error('Failed to disconnect broker', e);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          <span className="text-white/50">Loading broker status...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Broker Connection</h3>
          </div>
          {status?.connected && (
            <span className="flex items-center gap-1 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              Connected
            </span>
          )}
        </div>

        {status?.connected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#232323] p-3">
                <div className="text-xs text-white/50 mb-1">Portfolio Value</div>
                <div className="text-xl font-bold text-white">
                  ${status.account?.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="rounded-lg bg-[#232323] p-3">
                <div className="text-xs text-white/50 mb-1">Buying Power</div>
                <div className="text-xl font-bold text-emerald-400">
                  ${status.account?.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">
                {status.broker?.toUpperCase()} • {status.paperTrading ? 'Paper Trading' : 'Live Trading'}
              </span>
              <span className="text-white/60">
                {status.positionCount} positions
              </span>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-sm"
            >
              Disconnect Broker
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              Connect your Alpaca account to automatically execute trades that mirror this fund&apos;s positions.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Wallet className="h-5 w-5" />
              Connect Alpaca
            </button>
            <a
              href="https://app.alpaca.markets/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-sm text-white/50 hover:text-white transition"
            >
              Don&apos;t have an account? Sign up for free
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-[#404040] bg-[#232323] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Connect Alpaca</h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-white/70 mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="PK..."
                  className="w-full px-4 py-3 rounded-lg border border-[#404040] bg-[#313131] text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">API Secret</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-[#404040] bg-[#313131] text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaperTrading(!paperTrading)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    paperTrading ? 'bg-blue-600' : 'bg-[#404040]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      paperTrading ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-white/70">
                  Paper Trading {paperTrading && <span className="text-emerald-400">(Recommended for testing)</span>}
                </span>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={connecting}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>

                <a
                  href="https://app.alpaca.markets/paper/dashboard/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-white/50 hover:text-white"
                >
                  Get API keys from Alpaca Dashboard →
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
