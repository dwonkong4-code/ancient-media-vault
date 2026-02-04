// Pesapal Payment Integration - Serverless via Edge Functions
// API Documentation: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference

import { supabase } from "@/integrations/supabase/client";

export interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  redirect_mode?: "TOP_WINDOW" | "PARENT_WINDOW";
  callback_url: string;
  cancellation_url?: string;
  notification_id: string;
  branch?: string;
  billing_address: {
    phone_number?: string;
    email_address?: string;
    country_code?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

// Plan duration mapping
export const planDurations: Record<string, number> = {
  "2 Days": 2,
  "1 Week": 7,
  "2 Weeks": 14,
  "1 Month": 30,
  "3 Months": 90,
  "6 Months": 180,
  "1 Year": 365,
  Lifetime: -1,
  "LuoFree Plan": 30,
};

// Generate unique order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `LUA-${timestamp}-${randomPart}`.toUpperCase();
}

// Store payment data in localStorage for callback processing
export function storePaymentData(data: {
  orderId: string;
  orderTrackingId: string;
  userId: string;
  planName: string;
  planDays: number;
  amount: number;
  phoneNumber: string;
}): void {
  localStorage.setItem("pesapal_pending_payment", JSON.stringify(data));
}

export function getPendingPaymentData(): {
  orderId: string;
  orderTrackingId: string;
  userId: string;
  planName: string;
  planDays: number;
  amount: number;
  phoneNumber: string;
} | null {
  const data = localStorage.getItem("pesapal_pending_payment");
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

export function clearPendingPaymentData(): void {
  localStorage.removeItem("pesapal_pending_payment");
}

// Store auth token with expiry
function storeAuthToken(token: string, expiryDate: string): void {
  localStorage.setItem(
    "pesapal_auth",
    JSON.stringify({ token, expiryDate })
  );
}

function getStoredAuthToken(): { token: string; expiryDate: string } | null {
  const data = localStorage.getItem("pesapal_auth");
  if (data) {
    const parsed = JSON.parse(data);
    const expiry = new Date(parsed.expiryDate);
    const now = new Date();
    if (expiry.getTime() - now.getTime() > 5 * 60 * 1000) {
      return parsed;
    }
  }
  return null;
}

// Store IPN ID
function storeIPNId(ipnId: string): void {
  localStorage.setItem("pesapal_ipn_id", ipnId);
}

function getStoredIPNId(): string | null {
  return localStorage.getItem("pesapal_ipn_id");
}

// Get Pesapal Auth Token via Edge Function
export async function getPesapalAuthToken(): Promise<string> {
  const cached = getStoredAuthToken();
  if (cached) {
    return cached.token;
  }

  const { data, error } = await supabase.functions.invoke("pesapal-auth");

  if (error) {
    throw new Error(`Auth failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  storeAuthToken(data.token, data.expiryDate);
  return data.token;
}

// Register IPN URL via Edge Function
export async function registerIPNUrl(
  token: string,
  callbackUrl: string
): Promise<string> {
  const cachedIpnId = getStoredIPNId();
  if (cachedIpnId) {
    return cachedIpnId;
  }

  const { data, error } = await supabase.functions.invoke("pesapal-register-ipn", {
    body: { token, callbackUrl },
  });

  if (error) {
    throw new Error(`IPN registration failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  storeIPNId(data.ipnId);
  return data.ipnId;
}

// Submit Order Request via Edge Function
export async function submitOrderRequest(
  token: string,
  order: PesapalOrderRequest
): Promise<{ orderTrackingId: string; merchantReference: string; redirectUrl: string }> {
  const { data, error } = await supabase.functions.invoke("pesapal-submit-order", {
    body: { token, order },
  });

  if (error) {
    throw new Error(`Order submission failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    orderTrackingId: data.orderTrackingId,
    merchantReference: data.merchantReference,
    redirectUrl: data.redirectUrl,
  };
}

// Get Transaction Status via Edge Function
export async function getTransactionStatus(
  token: string,
  orderTrackingId: string
): Promise<{
  statusCode: number;
  status: string;
  confirmationCode?: string;
  message?: string;
  paymentMethod?: string;
  amount?: number;
  merchantReference?: string;
}> {
  const { data, error } = await supabase.functions.invoke("pesapal-transaction-status", {
    body: { token, orderTrackingId },
  });

  if (error) {
    throw new Error(`Status check failed: ${error.message}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Main function to initiate payment
export async function initiatePesapalPayment(params: {
  orderId: string;
  amount: number;
  description: string;
  callbackUrl: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}): Promise<{ redirectUrl: string; orderTrackingId: string; merchantReference: string }> {
  // Step 1: Get auth token
  const token = await getPesapalAuthToken();

  // Step 2: Register IPN URL
  const ipnId = await registerIPNUrl(token, params.callbackUrl);

  // Step 3: Submit order
  const orderRequest: PesapalOrderRequest = {
    id: params.orderId,
    currency: "UGX",
    amount: params.amount,
    description: params.description.substring(0, 100),
    redirect_mode: "TOP_WINDOW",
    callback_url: params.callbackUrl,
    notification_id: ipnId,
    billing_address: {
      email_address: params.email,
      phone_number: params.phoneNumber,
      first_name: params.firstName,
      last_name: params.lastName,
      country_code: "UG",
    },
  };

  const orderResponse = await submitOrderRequest(token, orderRequest);

  return {
    redirectUrl: orderResponse.redirectUrl,
    orderTrackingId: orderResponse.orderTrackingId,
    merchantReference: orderResponse.merchantReference,
  };
}

// Parse callback URL parameters
export function parseCallbackParams(searchParams: URLSearchParams): {
  orderTrackingId: string | null;
  orderMerchantReference: string | null;
  orderNotificationType: string | null;
} {
  return {
    orderTrackingId: searchParams.get("OrderTrackingId"),
    orderMerchantReference: searchParams.get("OrderMerchantReference"),
    orderNotificationType: searchParams.get("OrderNotificationType"),
  };
}

// Verify payment status after callback
export async function verifyPaymentStatus(
  orderTrackingId: string
): Promise<{
  success: boolean;
  status: string;
  statusCode: number;
  confirmationCode?: string;
  message?: string;
  paymentMethod?: string;
  amount?: number;
  merchantReference?: string;
}> {
  try {
    const token = await getPesapalAuthToken();
    const txStatus = await getTransactionStatus(token, orderTrackingId);

    const isSuccess = txStatus.statusCode === 1;

    return {
      success: isSuccess,
      status: txStatus.status || "UNKNOWN",
      statusCode: txStatus.statusCode,
      confirmationCode: txStatus.confirmationCode,
      message: txStatus.message,
      paymentMethod: txStatus.paymentMethod,
      amount: txStatus.amount,
      merchantReference: txStatus.merchantReference,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      status: "VERIFICATION_FAILED",
      statusCode: -1,
      message: "Could not verify payment status",
    };
  }
}
