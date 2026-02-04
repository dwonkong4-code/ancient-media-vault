import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PESAPAL_ENV = Deno.env.get("PESAPAL_ENV") || "sandbox";
const PESAPAL_URLS = {
  sandbox: "https://cybqa.pesapal.com/pesapalv3",
  production: "https://pay.pesapal.com/v3",
};
const PESAPAL_API_URL = PESAPAL_ENV === "production" ? PESAPAL_URLS.production : PESAPAL_URLS.sandbox;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY");
    const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET");

    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      throw new Error("PesaPal credentials not configured");
    }

    const response = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error || data.status !== "200") {
      throw new Error(data.message || "Authentication failed");
    }

    return new Response(JSON.stringify({ 
      token: data.token, 
      expiryDate: data.expiryDate 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PesaPal auth error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Authentication failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
