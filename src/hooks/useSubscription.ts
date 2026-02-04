import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserSubscription, Subscription } from "@/lib/subscription-service";

const ADMIN_EMAIL = "lightstarrecord@gmail.com";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin has free access
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      // Admin gets automatic subscription
      if (isAdmin) {
        setSubscription({
          isActive: true,
          plan: "Admin (Unlimited)",
          expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const sub = await checkUserSubscription(user.id);
        setSubscription(sub);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [user, isAdmin]);

  const hasActiveSubscription = isAdmin || (subscription?.isActive ?? false);

  const refreshSubscription = async () => {
    if (!user) return;
    
    if (isAdmin) {
      setSubscription({
        isActive: true,
        plan: "Admin (Unlimited)",
        expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      });
      return;
    }

    setIsLoading(true);
    try {
      const sub = await checkUserSubscription(user.id);
      setSubscription(sub);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    hasActiveSubscription,
    refreshSubscription,
    isAdmin,
  };
}
