import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import luoLogoTransparent from "@/assets/luo-ancient-logo-transparent.png";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
}

// Convert video URL to embed format (Google Drive, YouTube, Vimeo, etc.)
function getEmbedUrl(url: string): string {
  if (!url) return "";
  
  // Google Drive patterns
  const drivePatterns = [
    /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /https?:\/\/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of drivePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  
  // Return as-is for other embeddable URLs
  return url;
}

// Check if URL is a Google Drive URL
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

export function VideoModal({ open, onOpenChange, videoUrl, title }: VideoModalProps) {
  const embedUrl = getEmbedUrl(videoUrl);
  const showDriveOverlay = isGoogleDriveUrl(videoUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black relative">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
          {/* Transparent logo overlay to block Google Drive popout icon */}
          {showDriveOverlay && (
            <div 
              className="absolute top-0 right-0 pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
              style={{ zIndex: 2147483647 }}
            >
              <img 
                src={luoLogoTransparent} 
                alt="Luo Ancient Movies" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}