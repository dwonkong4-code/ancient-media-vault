import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6 lg:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Name and email address when you create an account</li>
                <li>Payment information for subscription services</li>
                <li>Viewing history and preferences</li>
                <li>Device information and IP address</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Personalize your experience and content recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-3">We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">6. Your Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
