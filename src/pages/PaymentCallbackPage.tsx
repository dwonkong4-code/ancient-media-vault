import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPendingPaymentData, 
  clearPendingPaymentData, 
  verifyPaymentStatus,
  parseCallbackParams 
} from "@/lib/pesapal";
import { activateSubscription } from "@/lib/subscription-service";

type CachedCallbackResult = {
  status: "success";
  message: string;
  confirmationCode?: string | null;
};

function callbackCacheKey(orderTrackingId: string) {
  return `pesapal_callback_result:${orderTrackingId}`;
}

function getCachedCallbackResult(orderTrackingId: string): CachedCallbackResult | null {
  try {
    const raw = sessionStorage.getItem(callbackCacheKey(orderTrackingId));
    if (!raw) return null;
    return JSON.parse(raw) as CachedCallbackResult;
  } catch {
    return null;
  }
}

function setCachedCallbackResult(orderTrackingId: string, result: CachedCallbackResult) {
  try {
    sessionStorage.setItem(callbackCacheKey(orderTrackingId), JSON.stringify(result));
  } catch {
    // ignore
  }
}

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const processedTrackingIdRef = useRef<string | null>(null);
  
  const [status, setStatus] = useState<"loading" | "verifying" | "success" | "failed" | "pending">("loading");
  const [message, setMessage] = useState("");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  // Parse callback params according to Pesapal API spec
  // URL format: ?OrderTrackingId=xxx&OrderMerchantReference=xxx&OrderNotificationType=CALLBACKURL
  const callbackParams = parseCallbackParams(searchParams);
  const trackingId = callbackParams.orderTrackingId;

  useEffect(() => {
    async function processPayment() {
      if (!trackingId) {
        setStatus("failed");
        setMessage("Payment was not completed. Please try again.");
        return;
      }

      // If we already confirmed success for this trackingId in this tab/session,
      // never re-verify (prevents success -> rerender -> failed loops).
      const cached = getCachedCallbackResult(trackingId);
      if (cached?.status === "success") {
        setStatus("success");
        setConfirmationCode(cached.confirmationCode || null);
        setMessage(cached.message);
        return;
      }

      // Get pending payment data from localStorage
      const paymentData = getPendingPaymentData();

      // Wait for auth to resolve; don't mark as failed immediately (avoids false negatives).
      if (!user) {
        setStatus("pending");
        setMessage("Please log in to complete your subscription activation.");
        return;
      }

      // Ensure we only run ONCE per trackingId (even if user object updates after activation)
      if (processedTrackingIdRef.current === trackingId) return;
      processedTrackingIdRef.current = trackingId;

      // If we don't have local pending data (e.g., user refreshed), still verify status once
      // and show a stable success message if completed.
      if (!paymentData) {
        setStatus("verifying");
        setMessage("Verifying your payment with Pesapal...");

        try {
          const verification = await verifyPaymentStatus(trackingId);
          if (verification.success && verification.statusCode === 1) {
            const msg = "Payment confirmed. Your subscription access should be active.";
            setStatus("success");
            setConfirmationCode(verification.confirmationCode || null);
            setMessage(msg);
            setCachedCallbackResult(trackingId, {
              status: "success",
              message: msg,
              confirmationCode: verification.confirmationCode || null,
            });
            return;
          }

          setStatus("pending");
          setMessage(
            `Payment status: ${verification.status}. Please wait a few minutes and check again.`
          );
          return;
        } catch (error) {
          console.error("Error verifying payment (no local data):", error);
          setStatus("pending");
          setMessage(
            "Could not verify payment status. Please try again in a few minutes or contact support."
          );
          return;
        }
      }

      // Verify the merchant reference matches our order
      if (callbackParams.orderMerchantReference && 
          callbackParams.orderMerchantReference !== paymentData.orderId) {
        setStatus("failed");
        setMessage("Order verification failed. Please contact support.");
        return;
      }

      // Verify payment status with Pesapal GetTransactionStatus API
      setStatus("verifying");
      setMessage("Verifying your payment with Pesapal...");

      try {
        const verification = await verifyPaymentStatus(trackingId);

        // Status codes: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
        if (verification.success && verification.statusCode === 1) {
          // Payment COMPLETED - activate subscription in Firebase
          const success = await activateSubscription(
            paymentData.userId,
            paymentData.planName,
            paymentData.orderId,
            trackingId
          );

          if (success) {
            const msg = `Your ${paymentData.planName} subscription is now active!`;
            setStatus("success");
            setConfirmationCode(verification.confirmationCode || null);
            setMessage(msg);

            // Cache success so any subsequent rerender does NOT re-verify and flip to failed
            setCachedCallbackResult(trackingId, {
              status: "success",
              message: msg,
              confirmationCode: verification.confirmationCode || null,
            });
            clearPendingPaymentData();
          } else {
            setStatus("failed");
            setMessage("Failed to activate subscription. Please contact support with your order ID: " + paymentData.orderId);
          }
        } else if (verification.statusCode === 0) {
          // INVALID - still processing or not yet complete
          setStatus("pending");
          setMessage("Your payment is being processed. Please wait a few minutes and check again.");
        } else if (verification.statusCode === 2) {
          // FAILED
          setStatus("failed");
          setMessage(`Payment failed: ${verification.message || "Please try again or contact support."}`);
        } else if (verification.statusCode === 3) {
          // REVERSED
          setStatus("failed");
          setMessage("Payment was reversed. Please contact support if you believe this is an error.");
        } else {
          // Unknown status
          setStatus("pending");
          setMessage(`Payment status: ${verification.status}. Please wait or contact support.`);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        
        // If verification fails but we have a tracking ID, set as pending
        // The user can try again or contact support
        setStatus("pending");
        setMessage("Could not verify payment status. Please try again in a few minutes or contact support with order ID: " + paymentData.orderId);
      }
    }

    // Small delay to show loading state
    const timer = setTimeout(processPayment, 1000);
    return () => clearTimeout(timer);
  }, [trackingId, callbackParams.orderMerchantReference, user?.id]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h1 className="text-2xl font-bold">Processing Payment</h1>
              <p className="text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {status === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h1 className="text-2xl font-bold">Verifying Payment</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-500">Payment Successful!</h1>
              <p className="text-muted-foreground">{message}</p>
              {confirmationCode && (
                <p className="text-sm text-muted-foreground">
                  Confirmation: <span className="font-mono">{confirmationCode}</span>
                </p>
              )}
              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={() => navigate("/")} className="w-full">
                  Start Watching
                </Button>
                <Button variant="outline" onClick={() => navigate("/movies")} className="w-full">
                  Browse Movies
                </Button>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 mx-auto flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-yellow-500">Payment Processing</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Check Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  Go Home
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-destructive/20 mx-auto flex items-center justify-center">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-destructive">Payment Failed</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex flex-col gap-2 mt-6">
                <Button onClick={() => navigate("/")} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
