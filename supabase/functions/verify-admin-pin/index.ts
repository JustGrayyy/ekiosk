import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== "string") {
      return new Response(JSON.stringify({ valid: false, error: "PIN is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminPin = Deno.env.get("ADMIN_PIN");
    if (!adminPin) {
      console.error("ADMIN_PIN secret is not configured");
      return new Response(JSON.stringify({ valid: false, error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = pin === adminPin;
    console.log(`PIN validation attempt: ${valid ? "SUCCESS" : "FAILED"}`);

    return new Response(JSON.stringify({ valid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in verify-admin-pin:", err);
    return new Response(JSON.stringify({ valid: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
