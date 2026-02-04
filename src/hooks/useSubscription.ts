import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { checkUserSubscription, Subscription } from "@/lib/subscription-service";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
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
  }, [user]);

  const hasActiveSubscription = subscription?.isActive ?? false;

  const refreshSubscription = async () => {
    if (!user) return;
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
  };
}
