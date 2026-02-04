import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Film, Tv, Megaphone, User } from "lucide-react";
import { ProfileModal } from "@/components/auth/ProfileModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const mobileNavItems = [
  { title: "Home", href: "/", icon: Home },
  { title: "Movies", href: "/movies", icon: Film },
  { title: "TV", href: "/tv-series", icon: Tv },
  { title: "Guide", href: "/adverts", icon: Megaphone },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
          {/* Profile button - opens modal instead of navigating */}
          <button
            onClick={handleProfileClick}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
              location.pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
      
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
