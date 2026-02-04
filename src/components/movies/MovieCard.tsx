import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play } from "lucide-react";
import type { Movie, Series, ContentItem } from "@/lib/firebase-db";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { AuthModal } from "@/components/auth/AuthModal";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";

interface MovieCardProps {
  movie: Movie | Series | ContentItem;
  contentType?: 'movie' | 'series';
}

export function MovieCard({ movie, contentType }: MovieCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Determine if it's a series
  const type = contentType || ('type' in movie ? movie.type : ('seasons' in movie ? 'series' : 'movie'));
  const isSeries = type === 'series';
  const seasons = isSeries && 'seasons' in movie ? movie.seasons : undefined;
  
  // Get the correct URL based on content type
  const watchUrl = isSeries ? `/watch/series/${movie.id}` : `/watch/${movie.id}`;
  
  // Get poster URL - support both posterUrl (Firebase) and poster (local)
  const posterUrl = 'posterUrl' in movie ? movie.posterUrl : ('poster' in movie ? (movie as any).poster : '');
  
  // Get genre - Firebase uses string, local uses array
  const genreDisplay = typeof movie.genre === 'string' ? movie.genre : (Array.isArray(movie.genre) ? movie.genre[0] : '');
  
  // Get year - Firebase uses releaseYear, local uses year
  const year = 'releaseYear' in movie ? movie.releaseYear : ('year' in movie ? (movie as any).year : '');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // For series, allow access to series page (subscription check on episode select)
    if (isSeries) {
      navigate(watchUrl);
      return;
    }
    
    // For movies, check auth and subscription
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return;
    }
    
    // User is logged in and has subscription
    navigate(watchUrl);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group block rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Play Button on Hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-150"
              style={{ background: "linear-gradient(135deg, #1cb7ff 1.22%, #2ff58b 50.24%)" }}
            >
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <span className="text-white text-xs font-medium mt-2 drop-shadow-lg">Play Now</span>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{movie.rating}</span>
            </div>
          </div>
          {isSeries && seasons && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded">
              S{seasons}
            </div>
          )}
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {year} • Trending
          </p>
        </div>
      </div>

      {/* Auth Modal for non-logged in users */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultMode="login" />
      
      {/* Subscription Modal for users without subscription */}
      <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
    </>
  );
}
