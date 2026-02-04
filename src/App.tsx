import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
