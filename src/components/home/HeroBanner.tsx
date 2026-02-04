import { Link } from "react-router-dom";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedContent, type ContentItem } from "@/lib/firebase-db";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

export function HeroBanner() {
  const [featuredList, setFeaturedList] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const content = await getFeaturedContent(10);
        setFeaturedList(content);
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (featuredList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [featuredList.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  }, [featuredList.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  }, [featuredList.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[300px] lg:h-[450px] overflow-hidden mb-8">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (featuredList.length === 0) {
    return null;
  }

  const featured = featuredList[currentIndex];
  const watchUrl = featured.type === 'series' ? `/watch/series/${featured.id}` : `/watch/${featured.id}`;

  return (
    <div className="relative h-[300px] lg:h-[450px] overflow-hidden mb-8 group mx-4 lg:mx-6 rounded-xl">
      {/* Background Image - Clear without fade/blur */}
      <div className="absolute inset-0">
        <img
          src={featured.posterUrl}
          alt={featured.title}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Navigation Arrows */}
      {featuredList.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content - Positioned at bottom with smaller text */}
      <div className="absolute bottom-12 left-0 right-0">
        <div className="px-4 lg:px-6">
          <div className="inline-block bg-background/70 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md">
            <h2 className="text-lg lg:text-xl font-bold mb-1">{featured.title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-foreground font-medium">{featured.rating}</span>
              </div>
              <span>{featured.releaseYear}</span>
              <span>{featured.genre}</span>
            </div>
            <Link to={watchUrl}>
              <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5 h-8 px-4 text-xs">
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {featuredList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {featuredList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-primary"
                  : "bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
