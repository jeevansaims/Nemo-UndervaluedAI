"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { 
  loadCustomInsights, 
  saveCustomInsights, 
  addCustomInsight 
} from "./insightStore"; 

export type InsightPost = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  contentMd: string;
  tickers: string[];
  fundSlug?: string | null;
  weekStart?: string | Date | null;
  weekEnd?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function useInsights() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [posts, setPosts] = useState<InsightPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/user/insights");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (e) { console.error(e); }
    } else {
      const local = loadCustomInsights();
      setPosts(local as unknown as InsightPost[]);
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (status === "loading") return;
    fetchPosts();
  }, [status, fetchPosts]);

  const createInsight = async (payload: Partial<InsightPost>) => {
    const newPost = {
      ...payload,
      status: payload.status || "DRAFT",
      tickers: payload.tickers || [],
    };

    if (isAuthenticated) {
      const res = await fetch("/api/user/insights", {
        method: "POST",
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        const created = await res.json();
        setPosts(prev => [created, ...prev]);
        return created;
      }
    } else {
      const id = "local_" + Date.now();
      const localPost = {
        ...newPost,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedList = addCustomInsight(localPost as any);
      setPosts(updatedList as unknown as InsightPost[]);
      return localPost;
    }
    return null;
  };

  const updateInsight = async (id: string, payload: Partial<InsightPost>) => {
    if (isAuthenticated) {
       const res = await fetch("/api/user/insights", {
         method: "PUT",
         body: JSON.stringify({ id, ...payload }),
       });
       if (res.ok) {
         const updated = await res.json();
         setPosts(prev => prev.map(p => p.id === id ? updated : p));
         return updated;
       }
    } else {
       const current = loadCustomInsights();
       const next = current.map((p: any) => {
         if (p.id === id) {
           return { ...p, ...payload, updatedAt: new Date().toISOString() };
         }
         return p;
       });
       saveCustomInsights(next);
       setPosts(next as unknown as InsightPost[]);
       return next.find((p: any) => p.id === id);
    }
    return null;
  };

  const deleteInsight = async (id: string) => {
     if (isAuthenticated) {
         await fetch(`/api/user/insights?id=${id}`, { method: "DELETE" });
         setPosts(prev => prev.filter(p => p.id !== id));
     } else {
         const current = loadCustomInsights();
         const next = current.filter((p: any) => p.id !== id);
         saveCustomInsights(next);
         setPosts(next as unknown as InsightPost[]);
     }
  };

  const getPost = (slugOrId: string) => {
      // Basic finder
      return posts.find(p => p.id === slugOrId || p.slug === slugOrId);
  };

  return {
    posts,
    loading,
    createInsight,
    updateInsight,
    deleteInsight,
    getPost,
    refresh: fetchPosts
  };
}
