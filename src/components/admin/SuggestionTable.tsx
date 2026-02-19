import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  message: string;
  created_at: string;
}

const SuggestionTable: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("suggestions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("suggestions" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({ title: "Deleted", description: "Suggestion removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8 text-primary font-mono">LOADING...</div>;

  return (
    <div className="space-y-4">
      {suggestions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 font-mono text-xs">NO SUGGESTIONS YET.</p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {suggestions.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background/40 border border-primary/10 rounded-lg p-4 flex justify-between items-start gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex-1">
                <p className="text-foreground text-sm leading-relaxed">{s.message}</p>
                <p className="text-muted-foreground text-[10px] mt-2 font-mono">
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionTable;
