import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6 lg:p-8 prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Luo Ancient, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. Use of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Luo Ancient provides streaming services for movies and TV series. You agree to use the service only for lawful purposes and in accordance with these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content provided on Luo Ancient is for personal, non-commercial use only. You may not reproduce, distribute, or create derivative works from any content without explicit permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Prohibited Activities</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using automated systems to access the service</li>
                <li>Sharing your account credentials with others</li>
                <li>Downloading or distributing content without permission</li>
                <li>Using the service for any illegal purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
