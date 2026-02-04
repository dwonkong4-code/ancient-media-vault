import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, Crown, Star, Zap, Smartphone, ArrowLeft, Loader2, ExternalLink, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type PaymentStep = "plans" | "phone" | "processing" | "redirect";

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [step, setStep] = useState<PaymentStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Close subscription modal and open auth if user is not logged in
  useEffect(() => {
    if (open && !user) {
      // User is not logged in, show auth modal instead
    }
  }, [open, user]);

  const resetState = () => {
    setStep("plans");
    setSelectedPlan(null);
    setPhoneNumber("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep("phone");
  };

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");

    try {
      // Generate order ID
      const orderId = generateOrderId();
      const planDays = planDurations[selectedPlan!.duration] || 30;

      // Format phone number for Pesapal (add Uganda country code if needed)
      let formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/^0/, "");
      if (!formattedPhone.startsWith("256")) {
        formattedPhone = "256" + formattedPhone;
      }

      const callbackUrl = `${window.location.origin}/payment/callback`;

      // Use user data for billing info
      const nameParts = user.name?.split(" ") || ["Customer"];
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Initiate Pesapal payment
      const { redirectUrl, orderTrackingId } = await initiatePesapalPayment({
        orderId,
        amount: selectedPlan!.price,
        description: `Luo Ancient - ${selectedPlan!.duration} Subscription`,
        callbackUrl,
        email: user.email,
        phoneNumber: formattedPhone,
        firstName,
        lastName,
      });

      // Store payment data for callback processing
      storePaymentData({
        orderId,
        orderTrackingId,
        userId: user.id,
        planName: selectedPlan!.duration,
        planDays,
        amount: selectedPlan!.price,
        phoneNumber: formattedPhone,
      });

      // Show redirect step and redirect to Pesapal
      setStep("redirect");
      
      // Redirect to Pesapal payment page
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setStep("phone");
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <>
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-md">
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        {step === "phone" && selectedPlan && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep("plans")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-xl">
                  Enter Phone Number
                </DialogTitle>
              </div>
              <DialogDescription className="sr-only">
                Enter your mobile money phone number to complete payment
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Plan Summary */}
              <div className="bg-accent rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">You're subscribing to</p>
                <p className="text-xl font-bold">{selectedPlan.duration} Plan</p>
                <p className="text-2xl font-bold text-primary">UGX {selectedPlan.priceDisplay}</p>
              </div>

              {/* Phone Number Only */}
              <div>
                <label className="text-sm font-medium">Phone Number (Mobile Money)</label>
                <Input
                  type="tel"
                  placeholder="e.g. 0771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg mt-1"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your MTN MoMo or Airtel Money number
                </p>
              </div>

              <Button 
                onClick={handlePayment} 
                className="w-full gradient-primary"
                size="lg"
                disabled={!user}
              >
                {user ? `Pay UGX ${selectedPlan.priceDisplay}` : "Login to Continue"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to Pesapal to complete payment securely
              </p>
            </div>
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

        {step === "redirect" && selectedPlan && (
          <div className="py-12 text-center space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>Redirecting to Pesapal</DialogTitle>
              <DialogDescription>You will be redirected to complete your payment</DialogDescription>
            </DialogHeader>
            <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold">Redirecting to Pesapal</h3>
            <p className="text-muted-foreground">
              You will be redirected to complete your payment of UGX {selectedPlan.priceDisplay}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span>Have your phone ready for the payment prompt</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
