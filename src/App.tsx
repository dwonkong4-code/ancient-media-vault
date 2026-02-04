import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import WatchPage from "./pages/WatchPage";
import NotFound from "./pages/NotFound";
import MoviesPage from "./pages/MoviesPage";
import TvSeriesPage from "./pages/TvSeriesPage";
import AdvertsPage from "./pages/AdvertsPage";
import AppsPage from "./pages/AppsPage";
import TrendingPage from "./pages/TrendingPage";
import RecentPage from "./pages/RecentPage";
import TopRatedPage from "./pages/TopRatedPage";
import DownloadPage from "./pages/DownloadPage";
import SearchPage from "./pages/SearchPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminSeries from "./pages/admin/AdminSeries";
import AdminEpisodes from "./pages/admin/AdminEpisodes";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import AdminAdverts from "./pages/admin/AdminAdverts";
import AdminApps from "./pages/admin/AdminApps";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/watch/series/:seriesId" element={<WatchPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/tv-series" element={<TvSeriesPage />} />
              <Route path="/adverts" element={<AdvertsPage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/recent" element={<RecentPage />} />
              <Route path="/top-rated" element={<TopRatedPage />} />
              <Route path="/api/download" element={<DownloadPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              <Route path="/subscribe" element={<Index />} />
              <Route path="/login" element={<Index />} />
              <Route path="/signup" element={<Index />} />
              <Route path="/profile" element={<Index />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />}>
                <Route path="" element={null} />
              </Route>
              <Route path="/admin/movies" element={<AdminDashboard />}>
                <Route path="" element={<AdminMovies />} />
              </Route>
              <Route path="/admin/series" element={<AdminDashboard />}>
                <Route path="" element={<AdminSeries />} />
              </Route>
              <Route path="/admin/episodes" element={<AdminDashboard />}>
                <Route path="" element={<AdminEpisodes />} />
              </Route>
              <Route path="/admin/users" element={<AdminDashboard />}>
                <Route path="" element={<AdminUsers />} />
              </Route>
              <Route path="/admin/subscriptions" element={<AdminDashboard />}>
                <Route path="" element={<AdminSubscriptions />} />
              </Route>
              <Route path="/admin/hero-slides" element={<AdminDashboard />}>
                <Route path="" element={<AdminHeroSlides />} />
              </Route>
              <Route path="/admin/adverts" element={<AdminDashboard />}>
                <Route path="" element={<AdminAdverts />} />
              </Route>
              <Route path="/admin/apps" element={<AdminDashboard />}>
                <Route path="" element={<AdminApps />} />
              </Route>
              <Route path="/admin/settings" element={<AdminDashboard />}>
                <Route path="" element={<AdminSettings />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
