import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
  barcode: string;
  name: string;
  category: string;
  points_value: number;
}

const ProductListTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("allowed_products" as any).select("*").order("name" as any);
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("allowed_products_changes")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "allowed_products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (barcode: string) => {
    const { error } = await supabase.from("allowed_products" as any).delete().eq("barcode", barcode);
    if (error) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Product removed from whitelist." });
      setProducts((prev) => prev.filter((p) => p.barcode !== barcode));
    }
  };

  if (loading) return <p className="text-muted-foreground text-[10px]">Loading...</p>;

  return (
    <div className="max-h-[300px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[8px] sm:text-[9px] px-2">BARCODE</TableHead>
            <TableHead className="text-[8px] sm:text-[9px] px-2">NAME</TableHead>
            <TableHead className="text-[8px] sm:text-[9px] px-2">TYPE</TableHead>
            <TableHead className="text-[8px] sm:text-[9px] px-2">PTS</TableHead>
            <TableHead className="text-[8px] sm:text-[9px] px-2 w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.barcode}>
              <TableCell className="text-[8px] sm:text-[9px] px-2 font-mono">{p.barcode}</TableCell>
              <TableCell className="text-[8px] sm:text-[9px] px-2">{p.name}</TableCell>
              <TableCell className="text-[8px] sm:text-[9px] px-2">{p.category}</TableCell>
              <TableCell className="text-[8px] sm:text-[9px] px-2">{p.points_value}</TableCell>
              <TableCell className="px-2">
                <button onClick={() => handleDelete(p.barcode)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-3 h-3" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground text-[9px]">
                No products registered
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductListTable;
