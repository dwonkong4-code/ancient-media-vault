// Pesapal Payment Integration
// API Documentation: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference

// Environment variables (set in .env or Vercel secrets)
const PESAPAL_CONSUMER_KEY = import.meta.env.VITE_PESAPAL_CONSUMER_KEY || "";
const PESAPAL_CONSUMER_SECRET = import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || "";
const PESAPAL_ENV = import.meta.env.VITE_PESAPAL_ENV || "sandbox";

// API URLs based on environment
const PESAPAL_URLS = {
  sandbox: "https://cybqa.pesapal.com/pesapalv3",
  production: "https://pay.pesapal.com/v3",
};

const PESAPAL_API_URL = PESAPAL_ENV === "production" ? PESAPAL_URLS.production : PESAPAL_URLS.sandbox;

export interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: {
    error_type: string;
    code: string;
    message: string;
  };
  status: string;
  message: string;
}

export interface PesapalIPNRegistration {
  url: string;
  created_date: string;
  ipn_id: string;
  error?: any;
  status: string;
}

// Matches exact API spec for SubmitOrderRequest
export interface PesapalOrderRequest {
  id: string; // Unique merchant reference, max 50 chars, alphanumeric with -_.:
  currency: string; // ISO Currency Code
  amount: number;
  description: string; // Max 100 chars
  redirect_mode?: "TOP_WINDOW" | "PARENT_WINDOW";
  callback_url: string;
  cancellation_url?: string;
  notification_id: string; // IPN URL ID from registration
  branch?: string;
  billing_address: {
    phone_number?: string;
    email_address?: string;
    country_code?: string; // ISO 3166-1, 2 chars
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string; // Max 3 chars
    postal_code?: string;
    zip_code?: string;
  };
}

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  status: string;
}

// Status codes: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
export interface PesapalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string; // INVALID, FAILED, COMPLETED, REVERSED
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number; // 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error?: {
    error_type: string | null;
    code: string | null;
    message: string | null;
    call_back_url: string | null;
  };
  status: string;
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
  Lifetime: -1, // Special value for lifetime
  "LuoFree Plan": 30, // Free promotional plan - 30 days access
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
    // Check if token is still valid (with 5 min buffer)
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

// Get Pesapal Auth Token
export async function getPesapalAuthToken(): Promise<string> {
  // Check for cached token first
  const cached = getStoredAuthToken();
  if (cached) {
    return cached.token;
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

  const data: PesapalAuthResponse = await response.json();

  if (data.error || data.status !== "200") {
    throw new Error(data.message || "Authentication failed");
  }

  // Cache the token
  storeAuthToken(data.token, data.expiryDate);

  return data.token;
}

// Register IPN URL (Instant Payment Notification)
export async function registerIPNUrl(
  token: string,
  callbackUrl: string
): Promise<string> {
  // Check for cached IPN ID
  const cachedIpnId = getStoredIPNId();
  if (cachedIpnId) {
    return cachedIpnId;
  }

  const response = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      ipn_notification_type: "GET",
    }),
  });

  if (!response.ok) {
    throw new Error(`IPN registration failed: ${response.status}`);
  }

  const data: PesapalIPNRegistration = await response.json();

  if (data.error || data.status !== "200") {
    throw new Error("IPN registration failed");
  }

  // Cache the IPN ID
  storeIPNId(data.ipn_id);

  return data.ipn_id;
}

// Submit Order Request
export async function submitOrderRequest(
  token: string,
  order: PesapalOrderRequest
): Promise<PesapalOrderResponse> {
  const response = await fetch(
    `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    }
  );

  if (!response.ok) {
    throw new Error(`Order submission failed: ${response.status}`);
  }

  const data: PesapalOrderResponse = await response.json();

  if (data.error || data.status !== "200") {
    throw new Error("Order submission failed");
  }

  return data;
}

// Get Transaction Status
export async function getTransactionStatus(
  token: string,
  orderTrackingId: string
): Promise<PesapalTransactionStatus> {
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

  const data: PesapalTransactionStatus = await response.json();

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

  // Step 3: Submit order with exact API spec
  const orderRequest: PesapalOrderRequest = {
    id: params.orderId,
    currency: "UGX",
    amount: params.amount,
    description: params.description.substring(0, 100), // Max 100 chars
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
    redirectUrl: orderResponse.redirect_url,
    orderTrackingId: orderResponse.order_tracking_id,
    merchantReference: orderResponse.merchant_reference,
  };
}

// Parse callback URL parameters
// Callback URL format: ?OrderTrackingId=xxx&OrderMerchantReference=xxx&OrderNotificationType=CALLBACKURL
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
// Uses GetTransactionStatus endpoint
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

    // Payment status codes from API:
    // 0 = INVALID
    // 1 = COMPLETED
    // 2 = FAILED
    // 3 = REVERSED

    const isSuccess = txStatus.status_code === 1;

    return {
      success: isSuccess,
      status: txStatus.payment_status_description || "UNKNOWN",
      statusCode: txStatus.status_code,
      confirmationCode: txStatus.confirmation_code,
      message: txStatus.message,
      paymentMethod: txStatus.payment_method,
      amount: txStatus.amount,
      merchantReference: txStatus.merchant_reference,
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
