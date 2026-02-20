import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Suggestion } from "@/hooks/useAdminAnalytics";

interface SuggestionListProps {
  data: Suggestion[];
  onRefetch: () => void;
}

const SuggestionList = ({ data, onRefetch }: SuggestionListProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from("suggestions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Suggestion removed." });
      onRefetch();
    } catch (err: any) {
      console.error("Delete suggestion error:", err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      const { error } = await supabase.from("suggestions").delete().neq("id", "");
      if (error) throw error;
      toast({ title: "Cleared", description: "All suggestions removed." });
      setConfirmClear(false);
      onRefetch();
    } catch (err: any) {
      console.error("Clear all suggestions error:", err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setClearingAll(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-muted-foreground text-[10px]">
        No suggestions submitted yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Clear All bar */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[9px]">
          {data.length} suggestion{data.length !== 1 ? "s" : ""}
        </span>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-destructive text-[9px] hover:text-destructive/80 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            CLEAR ALL
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            <span className="text-destructive text-[9px]">Confirm?</span>
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="text-destructive text-[9px] font-bold hover:underline"
            >
              {clearingAll ? "..." : "YES"}
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="text-muted-foreground text-[9px] hover:underline"
            >
              NO
            </button>
          </div>
        )}
      </div>

      {/* Scrollable suggestion list */}
      <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
        {data.map((s) => (
          <div
            key={s.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-background/30 border border-border/20 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-foreground/90 text-[10px] sm:text-[11px] break-words leading-relaxed">
                {s.message}
              </p>
              <p className="text-muted-foreground text-[8px] mt-0.5">
                {s.created_at
                  ? formatDistanceToNow(new Date(s.created_at), { addSuffix: true })
                  : "Unknown time"}
              </p>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              disabled={deleting === s.id}
              className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
              aria-label={`Delete suggestion: ${s.message.substring(0, 30)}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;
