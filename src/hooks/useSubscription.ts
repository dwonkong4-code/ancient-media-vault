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
    let cancelled = false;

    async function resolveSubscription() {
      if (!user) {
        if (!cancelled) {
          setSubscription(null);
          setIsLoading(false);
        }
        return;
      }

      // Admin gets automatic subscription
      if (isAdmin) {
        if (!cancelled) {
          setSubscription({
            isActive: true,
            plan: "Admin (Unlimited)",
            expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
          });
          setIsLoading(false);
        }
        return;
      }

      // Prefer the real-time plan from AuthContext (this updates immediately after admin activation)
      const plan = user.plan;
      const now = new Date();
      if (plan?.isActive && plan.expiresAt && new Date(plan.expiresAt) > now) {
        if (!cancelled) {
          setSubscription({
            isActive: true,
            plan: plan.name,
            expiresAt: new Date(plan.expiresAt),
            userId: user.id,
          });
          setIsLoading(false);
        }
        return;
      }

      // Fallback: query Firestore (covers edge cases where subscription exists but user doc hasn't updated yet)
      setIsLoading(true);
      try {
        const sub = await checkUserSubscription(user.id);
        if (!cancelled) setSubscription(sub);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        if (!cancelled) setSubscription(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolveSubscription();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.plan, isAdmin]);

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

    // If AuthContext already has an active plan, reflect it immediately
    const plan = user.plan;
    const now = new Date();
    if (plan?.isActive && plan.expiresAt && new Date(plan.expiresAt) > now) {
      setSubscription({
        isActive: true,
        plan: plan.name,
        expiresAt: new Date(plan.expiresAt),
        userId: user.id,
      });
      setIsLoading(false);
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
