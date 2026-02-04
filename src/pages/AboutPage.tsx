import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Globe, Smartphone, Play, Star, Users } from "lucide-react";

const features = [
  { icon: Film, text: "Extensive library of movies and TV series" },
  { icon: Star, text: "High-quality streaming in HD" },
  { icon: Play, text: "Regular updates with the latest releases" },
  { icon: Users, text: "User-friendly interface for easy navigation" },
  { icon: Globe, text: "Multiple genres including Action, Comedy, Drama, and more" },
  { icon: Smartphone, text: "Mobile apps for on-the-go entertainment" },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">About Luo Ancient</h1>
          <p className="text-muted-foreground text-lg">
            Your premier destination for streaming movies and TV series online.
          </p>
        </div>

        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6 lg:p-8">
            <p className="text-muted-foreground leading-relaxed text-lg">
              Welcome to Luo Ancient, your premier destination for streaming movies and TV series online. We are dedicated to bringing you the best entertainment experience with a vast collection of content from around the world.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border mb-8">
          <CardContent className="p-6 lg:p-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to provide accessible, high-quality entertainment to viewers everywhere. We believe that great stories should be available to everyone, which is why we offer a diverse library of movies and TV series across all genres.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6 lg:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
