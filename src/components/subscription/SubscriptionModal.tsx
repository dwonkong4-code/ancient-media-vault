import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, Crown, Star, Zap, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { generateOrderId, storePaymentData, planDurations, initiatePesapalPayment } from "@/lib/pesapal";
import { AuthModal } from "@/components/auth/AuthModal";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  { duration: "2 Days", price: 5000, priceDisplay: "5,000", icon: Zap },
  { duration: "1 Week", price: 10000, priceDisplay: "10,000", icon: Zap },
  { duration: "2 Weeks", price: 17000, priceDisplay: "17,000", icon: Star },
  { duration: "1 Month", price: 30000, priceDisplay: "30,000", icon: Star, popular: true },
  { duration: "3 Months", price: 70000, priceDisplay: "70,000", icon: Crown },
  { duration: "6 Months", price: 120000, priceDisplay: "120,000", icon: Crown },
  { duration: "1 Year", price: 200000, priceDisplay: "200,000", icon: Crown },
  { duration: "Lifetime", price: 1000000, priceDisplay: "1,000,000", icon: Crown, best: true },
];

const features = [
  "Unlimited movie streaming",
  "HD quality videos",
  "Download for offline viewing",
  "No ads interruption",
  "Access to all TV series",
  "Early access to new releases",
];

type PaymentStep = "plans" | "processing" | "redirect";

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [step, setStep] = useState<PaymentStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const resetState = () => {
    setStep("plans");
    setSelectedPlan(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handlePlanSelect = async (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }

    // Immediately start payment process
    setStep("processing");

    try {
      const orderId = generateOrderId();
      const planDays = planDurations[plan.duration] || 30;
      const callbackUrl = `${window.location.origin}/payment/callback`;

      const nameParts = user.name?.split(" ") || ["Customer"];
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Initiate Pesapal payment without phone number (Pesapal will collect it)
      const { redirectUrl, orderTrackingId } = await initiatePesapalPayment({
        orderId,
        amount: plan.price,
        description: `Luo Ancient - ${plan.duration} Subscription`,
        callbackUrl,
        email: user.email,
        phoneNumber: "", // Empty - Pesapal will collect
        firstName,
        lastName,
      });

      storePaymentData({
        orderId,
        orderTrackingId,
        userId: user.id,
        planName: plan.duration,
        planDays,
        amount: plan.price,
        phoneNumber: "",
      });

      setStep("redirect");
      
      // Redirect immediately
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setStep("plans");
    }
  };


  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-md ring-2 ring-highlight ring-offset-2 ring-offset-background">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Login Required</DialogTitle>
              <DialogDescription className="text-center">
                Please login or create an account to subscribe
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
                <LogIn className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground">
                You need to be logged in to purchase a subscription plan.
              </p>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  setAuthOpen(true);
                }}
                className="w-full gradient-primary"
                size="lg"
              >
                Login / Sign Up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultMode="login" />
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ring-2 ring-highlight ring-offset-2 ring-offset-background">
        {step === "plans" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">
                Choose Your Plan
              </DialogTitle>
              <DialogDescription className="text-center">
                Get unlimited access to all movies and TV series
              </DialogDescription>
            </DialogHeader>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2 py-4 border-b border-border">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    key={plan.duration}
                    onClick={() => handlePlanSelect(plan)}
                    className={`relative flex flex-col items-center p-4 rounded-xl border transition-all hover:scale-105 ${
                      plan.popular
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : plan.best
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    )}
                    {plan.best && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        BEST VALUE
                      </span>
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${plan.best ? "text-yellow-500" : "text-primary"}`} />
                    <span className="text-xs text-muted-foreground">{plan.duration}</span>
                    <span className="text-lg font-bold mt-1">UGX {plan.priceDisplay}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Powered by Pesapal • MTN MoMo & Airtel Money accepted
            </p>
          </>
        )}


        {step === "processing" && (
          <div className="py-12 text-center space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>Processing Payment</DialogTitle>
              <DialogDescription>Please wait while we prepare your payment</DialogDescription>
            </DialogHeader>
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <h3 className="text-xl font-bold">Preparing Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we prepare your payment...
            </p>
          </div>
        )}

        {step === "redirect" && (
          <div className="py-12 text-center space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>Redirecting</DialogTitle>
              <DialogDescription>Redirecting to payment</DialogDescription>
            </DialogHeader>
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <h3 className="text-xl font-bold">Redirecting...</h3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
