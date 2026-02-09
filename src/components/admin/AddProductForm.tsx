import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AddProductForm = () => {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("bottle");
  const [pointsValue, setPointsValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !name.trim()) {
      toast({ title: "Missing Fields", description: "Barcode and Name are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("allowed_products" as any)
        .insert({ barcode: barcode.trim(), name: name.trim(), category, points_value: pointsValue } as any);

      if (error) throw error;
      toast({ title: "Product Added", description: `${name.trim()} registered successfully.` });
      setBarcode("");
      setName("");
      setCategory("bottle");
      setPointsValue(1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add product.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="text-[9px] sm:text-[10px] text-muted-foreground">BARCODE</Label>
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="e.g. 4801981126012"
          className="h-8 text-xs bg-background/50 border-border"
        />
      </div>
      <div>
        <Label className="text-[9px] sm:text-[10px] text-muted-foreground">NAME</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Coca-Cola 500ml"
          className="h-8 text-xs bg-background/50 border-border"
        />
      </div>
      <div>
        <Label className="text-[9px] sm:text-[10px] text-muted-foreground">CATEGORY</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 text-xs bg-background/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bottle">Bottle</SelectItem>
            <SelectItem value="can">Can</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[9px] sm:text-[10px] text-muted-foreground">POINTS VALUE</Label>
        <Input
          type="number"
          min={1}
          value={pointsValue}
          onChange={(e) => setPointsValue(Number(e.target.value) || 1)}
          className="h-8 text-xs bg-background/50 border-border"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-8 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "ADDING..." : "ADD PRODUCT"}
      </button>
    </form>
  );
};

export default AddProductForm;
