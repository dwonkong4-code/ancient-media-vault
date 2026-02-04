import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { getAdminStats } from "@/lib/admin-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Film,
  Tv,
  Users,
  CreditCard,
  LayoutDashboard,
  Image,
  Megaphone,
  Download,
  Settings,
  LogOut,
  PlayCircle,
  Menu,
  X,
} from "lucide-react";
import luoAncientLogo from "@/assets/luo-ancient-logo.png";

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Movies", href: "/admin/movies", icon: Film },
  { title: "TV Series", href: "/admin/series", icon: Tv },
  { title: "Episodes", href: "/admin/episodes", icon: PlayCircle },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { title: "Hero Slides", href: "/admin/hero-slides", icon: Image },
  { title: "Guide/Adverts", href: "/admin/adverts", icon: Megaphone },
  { title: "Apps", href: "/admin/apps", icon: Download },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

interface Stats {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalAdverts: number;
  totalHeroImages: number;
  totalApps: number;
}

export default function AdminDashboard() {
  const { isAdminAuthenticated, logoutAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    loadStats();
  }, [isAdminAuthenticated, navigate]);

  const loadStats = async () => {
    const data = await getAdminStats();
    setStats(data);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const isDashboardHome = location.pathname === "/admin/dashboard";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <img
              src={luoAncientLogo}
              alt="Logo"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Luo Ancient Movies</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {isDashboardHome ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to the admin panel. Manage all your content here.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                  <Film className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalMovies || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Series</CardTitle>
                  <Tv className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSeries || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
                  <PlayCircle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalEpisodes || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {stats?.activeSubscriptions || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Hero Slides</CardTitle>
                  <Image className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalHeroImages || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Guide/Adverts</CardTitle>
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAdverts || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Apps</CardTitle>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalApps || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/admin/movies">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Film className="w-6 h-6" />
                    <span>Add Movie</span>
                  </Button>
                </Link>
                <Link to="/admin/series">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Tv className="w-6 h-6" />
                    <span>Add Series</span>
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>Manage Users</span>
                  </Button>
                </Link>
                <Link to="/admin/hero-slides">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Image className="w-6 h-6" />
                    <span>Hero Slides</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
