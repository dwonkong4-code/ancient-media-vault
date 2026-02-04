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
    const { token, orderTrackingId } = await req.json();

    if (!token || !orderTrackingId) {
      throw new Error("Missing token or orderTrackingId");
    }

    const response = await fetch(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      statusCode: data.status_code,
      status: data.payment_status_description,
      confirmationCode: data.confirmation_code,
      message: data.message,
      paymentMethod: data.payment_method,
      amount: data.amount,
      merchantReference: data.merchant_reference,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PesaPal status check error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Status check failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
