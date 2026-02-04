import { MainLayout } from "@/components/layout/MainLayout";
import { getAdverts, type Advert } from "@/lib/firebase-db";
import { Megaphone, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [loading, setLoading] = useState(true);

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
              <a
                key={advert.id}
                href={advert.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg overflow-hidden border border-border bg-card hover:border-primary transition-colors"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={advert.imageUrl}
                    alt={advert.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {advert.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {advert.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
