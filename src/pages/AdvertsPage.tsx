import { MainLayout } from "@/components/layout/MainLayout";
import { getAdverts, type Advert } from "@/lib/firebase-db";
import { Megaphone, Play, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { VideoModal } from "@/components/guide/VideoModal";

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    async function fetchAdverts() {
      try {
        const fetchedAdverts = await getAdverts();
        setAdverts(fetchedAdverts);
      } catch (error) {
        console.error("Error fetching adverts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdverts();
  }, []);

  const handlePlayClick = (advert: Advert) => {
    setSelectedVideo({ url: advert.linkUrl, title: advert.title });
  };

  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-6 pb-24 lg:pb-8">
        <h1 className="text-2xl font-bold mb-6">Guide</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : adverts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              Advertise your business with Luo Ancient Movies. Reach thousands of viewers across Uganda and beyond.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adverts.map((advert) => (
              <div
                key={advert.id}
                onClick={() => handlePlayClick(advert)}
                className="group block rounded-lg overflow-hidden border border-border bg-card hover:border-primary transition-colors cursor-pointer"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={advert.imageUrl}
                    alt={advert.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                      style={{ background: "linear-gradient(135deg, #1cb7ff 1.22%, #2ff58b 50.24%)" }}
                    >
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {advert.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {advert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        open={!!selectedVideo}
        onOpenChange={(open) => !open && setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ""}
        title={selectedVideo?.title || ""}
      />
    </MainLayout>
  );
}
