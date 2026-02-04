import { MainLayout } from "@/components/layout/MainLayout";
import { MovieCard } from "@/components/movies/MovieCard";
import { getMovies, getSeries, type ContentItem } from "@/lib/firebase-db";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function TopRatedPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRated() {
      try {
        const [movies, series] = await Promise.all([getMovies(), getSeries()]);
        
        // Combine and filter by rating >= 7.5, then sort by rating
        const allContent: ContentItem[] = [
          ...movies.filter(m => m.rating >= 7.5).map(m => ({ ...m, type: 'movie' as const })),
          ...series.filter(s => s.rating >= 7.5).map(s => ({ ...s, type: 'series' as const }))
        ];
        
        allContent.sort((a, b) => b.rating - a.rating);
        setContent(allContent);
      } catch (error) {
        console.error("Error fetching top rated content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopRated();
  }, []);

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold mb-6">⭐ Top Rated</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : content.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No top rated content available. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 lg:gap-4">
            {content.map((item) => (
              <MovieCard key={item.id} movie={item} contentType={item.type} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
