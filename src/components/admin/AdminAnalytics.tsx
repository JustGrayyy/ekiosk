import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Smile, Trophy, MessageSquare, AlertCircle } from "lucide-react";
import SuggestionTable from "./SuggestionTable";
import { toast } from "@/hooks/use-toast";

const AdminAnalytics: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [triviaData, setTriviaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching Admin Data...");
        const [sentimentRes, triviaRes, suggestionsRes] = await Promise.all([
          supabase.from("sentiment_logs").select("*"),
          supabase.from("trivia_logs").select("*"),
          supabase.from("suggestions").select("*")
        ]);

        if (sentimentRes.error) throw new Error(`Sentiment Error: ${sentimentRes.error.message}`);
        if (triviaRes.error) throw new Error(`Trivia Error: ${triviaRes.error.message}`);
        if (suggestionsRes.error) throw new Error(`Suggestions Error: ${suggestionsRes.error.message}`);

        if (sentimentRes.data) {
          const expectedFeelings = ['Happy', 'Proud', 'Neutral'];
          const counts = sentimentRes.data.reduce((acc: any, curr: any) => {
            const feeling = curr.feeling;
            if (expectedFeelings.includes(feeling)) {
              acc[feeling] = (acc[feeling] || 0) + 1;
            }
            return acc;
          }, {});
          
          // Data format for PieChart: [{ name: 'Happy', value: 10 }, { name: 'Proud', value: 15 }]
          const formatted = expectedFeelings.map(name => ({
            name,
            value: counts[name] || 0
          }));
          setSentimentData(formatted);
        }

        if (triviaRes.data) {
          const total = triviaRes.data.length;
          const correctCount = triviaRes.data.filter((t: any) => t.is_correct === true).length;
          const incorrectCount = total - correctCount;
          
          // Data format for success rate chart
          setTriviaData([
            { name: "Correct", value: correctCount },
            { name: "Incorrect", value: incorrectCount }
          ]);
        }
      } catch (err: any) {
        console.error("Error fetching admin data:", err);
        toast({
          title: "Admin Sync Error",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Chart */}
        <div className="kiosk-panel p-6 rounded-2xl border-2 border-primary/10">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Smile className="w-5 h-5" />
            STUDENT SENTIMENT
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#061a11", border: "1px solid #10b981", color: "#10b981" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trivia Chart */}
        <div className="kiosk-panel p-6 rounded-2xl border-2 border-primary/10">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            TRIVIA SUCCESS RATE
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={triviaData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: "#061a11", border: "1px solid #10b981", color: "#10b981" }}
                   itemStyle={{ color: "#10b981" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Suggestions Table Section */}
      <div className="kiosk-panel p-6 rounded-2xl border-2 border-primary/10">
        <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          STUDENT SUGGESTIONS
        </h3>
        <SuggestionTable />
      </div>
    </div>
  );
};

export default AdminAnalytics;
