import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Film,
  Tv,
  Megaphone,
  Download,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import luoAncientLogo from "@/assets/luo-ancient-logo.png";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";

const navItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Movies", href: "/movies", icon: Film },
  { title: "TV Series", href: "/tv-series", icon: Tv },
  { title: "Guide", href: "/adverts", icon: Megaphone },
  { title: "Apps", href: "/apps", icon: Download },
  { title: "Trending", href: "/trending", icon: TrendingUp },
  { title: "Recently Added", href: "/recent", icon: Clock },
  { title: "Top Rated", href: "/top-rated", icon: Star },
];

export function Sidebar() {
  const location = useLocation();
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
          <img 
            src={luoAncientLogo} 
            alt="Luo Ancient Movies" 
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <h1 className="text-base font-bold text-sidebar-foreground leading-tight">
            Luo Ancient Movies
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Subscribe CTA */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="gradient-subscribe rounded-lg p-4 border border-primary/30">
            <h3 className="text-sm font-semibold mb-2">Subscribe Now</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get unlimited access to all content
            </p>
            <button
              onClick={() => setSubscriptionOpen(true)}
              className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2 rounded-lg text-center transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </aside>

      <SubscriptionModal open={subscriptionOpen} onOpenChange={setSubscriptionOpen} />
    </>
  );
}
