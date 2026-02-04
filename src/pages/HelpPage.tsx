import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserPlus, CreditCard, Tv, Download, Settings, Headphones } from "lucide-react";

const helpSections = [
  {
    title: "Getting Started",
    icon: UserPlus,
    items: [
      {
        question: "How do I create an account?",
        answer: "Click the \"Sign Up\" button in the top right corner and fill in your details. You'll receive a confirmation email to verify your account."
      },
      {
        question: "How do I subscribe?",
        answer: "After creating an account, click on \"Subscribe Now\" in your profile menu. Choose a plan that suits you and complete the payment process."
      }
    ]
  },
  {
    title: "Watching Content",
    icon: Tv,
    items: [
      {
        question: "What devices can I watch on?",
        answer: "You can watch Luo Ancient on any device with a web browser, including computers, tablets, and smartphones. We also offer mobile apps for iOS and Android."
      },
      {
        question: "Can I download content for offline viewing?",
        answer: "Yes! Premium subscribers can download select movies and series to watch offline through our mobile apps."
      }
    ]
  },
  {
    title: "Account & Billing",
    icon: CreditCard,
    items: [
      {
        question: "How do I cancel my subscription?",
        answer: "Go to your profile settings and click on \"Manage Subscription\". You can cancel anytime, and you'll continue to have access until the end of your billing period."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, debit cards, and mobile money payments through our secure payment gateway."
      }
    ]
  },
  {
    title: "Technical Support",
    icon: Headphones,
    items: [
      {
        question: "Video won't play or keeps buffering",
        answer: "Try refreshing the page, checking your internet connection, or lowering the video quality. If the problem persists, contact our support team."
      },
      {
        question: "I forgot my password",
        answer: "Click \"Forgot Password\" on the login page and enter your email. We'll send you instructions to reset your password."
      }
    ]
  }
];

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="px-4 lg:px-6 py-8 pb-24 lg:pb-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions and learn how to get the most out of Luo Ancient.
          </p>
        </div>

        <div className="space-y-8">
          {helpSections.map((section) => (
            <Card key={section.title} className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <section.icon className="w-6 h-6 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border">
                      <AccordionTrigger className="text-left hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-4">
              Our support team is here to assist you with any questions or issues.
            </p>
            <a 
              href="mailto:support@luoancient.com" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
