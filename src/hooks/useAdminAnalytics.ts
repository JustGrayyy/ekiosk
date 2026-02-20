import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SentimentLog {
  id: string;
  feeling: string;
  created_at: string | null;
}

export interface TriviaLog {
  id: string;
  question_id: number;
  is_correct: boolean;
  created_at: string | null;
}

export interface Suggestion {
  id: string;
  message: string;
  created_at: string | null;
}

interface AdminAnalyticsState {
  sentimentLogs: SentimentLog[];
  triviaLogs: TriviaLog[];
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
}

export function useAdminAnalytics() {
  const [state, setState] = useState<AdminAnalyticsState>({
    sentimentLogs: [],
    triviaLogs: [],
    suggestions: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Check auth session (informational only -- admin auth is PIN-based)
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.warn("No Supabase auth session found (PIN-based admin auth is in use)");
      }

      const [sentimentRes, triviaRes, suggestionsRes] = await Promise.all([
        supabase.from("sentiment_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("trivia_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("suggestions").select("*").order("created_at", { ascending: false }),
      ]);

      if (sentimentRes.error) throw new Error(`Sentiment fetch failed: ${sentimentRes.error.message}`);
      if (triviaRes.error) throw new Error(`Trivia fetch failed: ${triviaRes.error.message}`);
      if (suggestionsRes.error) throw new Error(`Suggestions fetch failed: ${suggestionsRes.error.message}`);

      const sentimentLogs = (sentimentRes.data ?? []) as unknown as SentimentLog[];
      const triviaLogs = (triviaRes.data ?? []) as unknown as TriviaLog[];
      const suggestions = (suggestionsRes.data ?? []) as unknown as Suggestion[];

      console.log("Found", sentimentLogs.length, "sentiment logs");
      console.log("Found", triviaLogs.length, "trivia logs");
      console.log("Found", suggestions.length, "suggestions");

      setState({
        sentimentLogs,
        triviaLogs,
        suggestions,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Admin analytics fetch error:", err.message);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? "Unknown error",
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
