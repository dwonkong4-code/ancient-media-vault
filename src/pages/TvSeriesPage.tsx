import { MainLayout } from "@/components/layout/MainLayout";
import { MovieCard } from "@/components/movies/MovieCard";
import { getSeries, type Series } from "@/lib/firebase-db";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function TvSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const fetchedSeries = await getSeries();
        setSeries(fetchedSeries);
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, []);

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold mb-6">TV Series</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : series.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No TV series available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
            {series.map((s) => (
              <MovieCard key={s.id} movie={s} contentType="series" />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
