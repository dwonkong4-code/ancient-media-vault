import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY");
    const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET");
    const PESAPAL_ENV = Deno.env.get("PESAPAL_ENV") || "sandbox";

    if (!PESAPAL_CONSUMER_KEY) {
      console.error("PESAPAL_CONSUMER_KEY is not configured");
      throw new Error("PESAPAL_CONSUMER_KEY is not configured");
    }

    if (!PESAPAL_CONSUMER_SECRET) {
      console.error("PESAPAL_CONSUMER_SECRET is not configured");
      throw new Error("PESAPAL_CONSUMER_SECRET is not configured");
    }

    const PESAPAL_API_URL = PESAPAL_ENV === "production" 
      ? "https://pay.pesapal.com/v3" 
      : "https://cybqa.pesapal.com/pesapalv3";

    console.log(`Using PesaPal ${PESAPAL_ENV} environment: ${PESAPAL_API_URL}`);

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

    const data = await response.json();
    console.log("PesaPal auth response status:", data.status, "message:", data.message);

    if (!response.ok) {
      console.error("PesaPal auth HTTP error:", response.status, data);
      throw new Error(`Auth failed with HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    if (data.error) {
      console.error("PesaPal auth error in response:", data.error);
      throw new Error(data.error.message || "Authentication failed");
    }

    if (data.status !== "200") {
      console.error("PesaPal auth non-200 status:", data);
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
