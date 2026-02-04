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
    const { token, order } = await req.json();

    if (!token || !order) {
      throw new Error("Missing token or order data");
    }

    const response = await fetch(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Order submission failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error || data.status !== "200") {
      throw new Error("Order submission failed");
    }

    return new Response(JSON.stringify({
      orderTrackingId: data.order_tracking_id,
      merchantReference: data.merchant_reference,
      redirectUrl: data.redirect_url,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PesaPal order submission error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Order submission failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
