import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "How do I respond to an incident alert?",
    answer:
      "When you receive an incident alert, tap on the notification or navigate to the Incidents tab. Select the incident and tap 'Respond' to indicate you're on your way. You can add notes and photos once you arrive at the scene.",
  },
  {
    question: "How do I update my location tracking settings?",
    answer:
      "Go to Profile > Preferences and toggle the Location Tracking switch. This helps dispatchers see your current location and assign you to nearby incidents more efficiently.",
  },
  {
    question: "What should I do if I can't access an incident location?",
    answer:
      "Document the access issue in the incident notes and contact your supe immediately. Include photos if possible and mark any safety concerns.",
  },
  {
    question: "How do I upload photos and documents?",
    answer:
      "Open the incident details, go to the Docs tab, and tap 'Take Photo'. You can add a message with context for each photo you upload.",
  },
  {
    question: "Can I view past incidents I've responded to?",
    answer:
      "Yes, all incidents you've interacted with are saved in your incident history. You can access them from the Incidents tab by filtering for past incidents.",
  },
  {
    question: "How do I get my account verified?",
    answer:
      "Upload a valid government-issued ID through Profile > ID Verification. Your account will be reviewed by an administrator within 24-48 hours.",
  },
];

export default function HelpSupportPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3">
        <Link
          href="/profile"
          className="rounded-full p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Help & Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href="mailto:support@nfaalerts.com"
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    support@nfaalerts.com
                  </p>
                </div>
              </a>

              <Separator />

              <a
                href="tel:+18005550123"
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <PhoneIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">
                    (800) 555-0123
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mon-Fri, 8AM-6PM EST
                  </p>
                </div>
              </a>

              <Separator />

              <button className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors w-full">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">
                    Chat with our support team
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <h3 className="font-medium">{faq.question}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For immediate emergencies or critical system issues, please
                  contact your department supe or call our emergency hotline.
                </p>
                <Button className="w-full h-11" variant="destructive">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Emergency Hotline: 911
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
