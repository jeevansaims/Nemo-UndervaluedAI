"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import type { AlertType } from "@/lib/alerts/alertSchemas";

const LOCAL_STORAGE_KEY_SUBS = "nemo_alert_subs_tickers";

export function useAlertSettings() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [subscribedTickers, setSubscribedTickers] = useState<string[]>([]);
  const [enabledTypes, setEnabledTypes] = useState<AlertType[] | "ALL">("ALL"); 
  
  const [loading, setLoading] = useState(true);

  // Load from source
  useEffect(() => {
    if (status === "loading") return;

    if (isAuthenticated) {
      // Fetch Subs
      const p1 = fetch("/api/user/alert-subs").then(r => r.ok ? r.json() : { subs: [] });
      // Fetch Prefs
      const p2 = fetch("/api/user/alert-prefs").then(r => r.ok ? r.json() : { types: null });
      
      Promise.all([p1, p2]).then(([subsData, prefsData]) => {
        if (subsData.subs) {
             setSubscribedTickers(subsData.subs.map((s: any) => s.ticker));
        }
        if (prefsData.types) {
            const t = prefsData.types;
            if (Array.isArray(t) && t.length > 0) {
                 setEnabledTypes([t[0] as AlertType]);
            } else {
                 setEnabledTypes("ALL");
            }
        }
        setLoading(false);
      }).catch(e => {
          console.error(e);
          setLoading(false);
      });
    } else {
      // Local Storage
      try {
        const storedSubs = localStorage.getItem(LOCAL_STORAGE_KEY_SUBS);
        if (storedSubs) {
           setSubscribedTickers(JSON.parse(storedSubs));
        }
      } catch {}
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  // Actions
  const toggleSubscription = useCallback(async (ticker: string) => {
    const t = ticker.toUpperCase().trim();
    let newSubs: string[] = [];

    // Optimistic Calculation
    setSubscribedTickers(prev => {
       if (prev.includes(t)) {
           newSubs = prev.filter(x => x !== t);
           return newSubs;
       } else {
           newSubs = [...prev, t].sort();
           return newSubs;
       }
    });

    if (isAuthenticated) {
        // Redundant check for 'method' is avoided if we trust optimistic update will happen.
        // But for network call we need correct method.
        const wasSubscribed = subscribedTickers.includes(t);
        const method = wasSubscribed ? "DELETE" : "POST";
        const url = wasSubscribed ? `/api/user/alert-subs?ticker=${t}` : `/api/user/alert-subs`;

        try {
             await fetch(url, {
                 method,
                 body: method === "POST" ? JSON.stringify({ ticker: t }) : undefined
             });
        } catch (e) { console.error(e); }
    } else {
        const current = subscribedTickers;
        const next = current.includes(t) ? current.filter(x => x !== t) : [...current, t].sort();
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBS, JSON.stringify(next));
    }
  }, [isAuthenticated, subscribedTickers]);

  const setTypeFilter = useCallback(async (type: AlertType | "ALL") => {
      setEnabledTypes(type === "ALL" ? "ALL" : [type]);
      if (isAuthenticated) {
          try {
              const typesToStore = type === "ALL" ? [] : [type];
              await fetch("/api/user/alert-prefs", {
                  method: "POST",
                  body: JSON.stringify({ types: typesToStore })
              });
          } catch (e) { console.error(e); }
      }
  }, [isAuthenticated]);

  const isSubscribed = useCallback((ticker: string) => {
      return subscribedTickers.includes(ticker.toUpperCase().trim());
  }, [subscribedTickers]);

  return {
      subscribedTickers,
      enabledTypes,
      loading,
      toggleSubscription,
      setTypeFilter,
      isSubscribed
  };
}
