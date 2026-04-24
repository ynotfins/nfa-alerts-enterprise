import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LegalTabs } from "@/components/legal-tabs";

export default async function TermsPrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab || "terms";

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-3">
        <Link
          href="/profile"
          className="rounded-full p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Legal</h1>
      </div>

      <LegalTabs />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {activeTab === "terms" ? (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Last Updated: January 15, 2025
                  </p>
                  <h2 className="text-xl font-bold mb-4">Terms of Service</h2>
                  <p className="text-sm text-muted-foreground">
                    Welcome to NFA Alerts. By accessing or using our emergency response platform,
                    you agree to be bound by these Terms of Service.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">1. Acceptance of Terms</h3>
                    <p className="text-sm text-muted-foreground">
                      By creating an account and using NFA Alerts, you acknowledge that you have
                      read, understood, and agree to be bound by these Terms of Service and our
                      Privacy Policy. If you do not agree to these terms, you may not use our
                      services.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">2. User Accounts and Registration</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      To use NFA Alerts, you must register for an account and provide accurate,
                      current, and complete information. You are responsible for:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Maintaining the confidentiality of your account credentials</li>
                      <li>All activities that occur under your account</li>
                      <li>Notifying us immediately of any unauthorized use</li>
                      <li>Ensuring your profile information remains accurate and up-to-date</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">3. Authorized Users</h3>
                    <p className="text-sm text-muted-foreground">
                      NFA Alerts is designed for authorized emergency response personnel only.
                      Users must be affiliated with a recognized fire department, emergency
                      services organization, or approved partner agency. Unauthorized access or
                      use of the platform is strictly prohibited.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">4. User Responsibilities</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      As a user of NFA Alerts, you agree to:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Respond to incidents in a timely and professional manner</li>
                      <li>Provide accurate incident reports and documentation</li>
                      <li>Respect the privacy and confidentiality of all parties involved</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Use the platform solely for authorized emergency response purposes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">5. Location Services</h3>
                    <p className="text-sm text-muted-foreground">
                      By enabling location tracking, you consent to the collection and sharing of
                      your real-time location data with dispatchers and authorized personnel for
                      emergency response coordination. You may disable location tracking at any
                      time through your profile settings.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">6. Prohibited Conduct</h3>
                    <p className="text-sm text-muted-foreground mb-2">You may not:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Misuse or abuse the platform for non-emergency purposes</li>
                      <li>Submit false or misleading incident reports</li>
                      <li>Interfere with the platform&apos;s operation or security</li>
                      <li>Share your account credentials with unauthorized individuals</li>
                      <li>Use the platform to harass, threaten, or harm others</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">7. Intellectual Property</h3>
                    <p className="text-sm text-muted-foreground">
                      All content, features, and functionality of NFA Alerts are owned by National
                      Fire Alerts and are protected by copyright, trademark, and other
                      intellectual property laws. You may not copy, modify, distribute, or
                      reverse engineer any part of the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">8. Limitation of Liability</h3>
                    <p className="text-sm text-muted-foreground">
                      NFA Alerts is provided &quot;as is&quot; without warranties of any kind. We are not
                      liable for any damages arising from your use of the platform, including but
                      not limited to direct, indirect, incidental, or consequential damages.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">9. Termination</h3>
                    <p className="text-sm text-muted-foreground">
                      We reserve the right to suspend or terminate your account at any time for
                      violation of these terms or for any other reason. Upon termination, your
                      right to use the platform will immediately cease.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">10. Changes to Terms</h3>
                    <p className="text-sm text-muted-foreground">
                      We may update these Terms of Service from time to time. We will notify you
                      of any material changes by posting the updated terms on the platform.
                      Continued use of NFA Alerts after changes constitutes acceptance of the new
                      terms.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">11. Contact Information</h3>
                    <p className="text-sm text-muted-foreground">
                      For questions about these Terms of Service, please contact us at
                      legal@nfaalerts.com or (800) 555-0123.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Last Updated: January 15, 2025
                  </p>
                  <h2 className="text-xl font-bold mb-4">Privacy Policy</h2>
                  <p className="text-sm text-muted-foreground">
                    At NFA Alerts, we take your privacy seriously. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your information when you use
                    our emergency response platform.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">1. Information We Collect</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We collect several types of information to provide and improve our services:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>
                        <strong>Personal Information:</strong> Name, email address, phone number,
                        date of birth, driver&apos;s license information, and emergency contact details
                      </li>
                      <li>
                        <strong>Professional Information:</strong> Department affiliation, role,
                        employee ID, and certifications
                      </li>
                      <li>
                        <strong>Location Data:</strong> Real-time GPS location when you enable
                        location tracking
                      </li>
                      <li>
                        <strong>Incident Data:</strong> Photos, notes, and reports you create
                        related to incidents
                      </li>
                      <li>
                        <strong>Device Information:</strong> Device type, operating system, and
                        app version
                      </li>
                      <li>
                        <strong>Usage Data:</strong> How you interact with the platform and
                        features you use
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">2. How We Use Your Information</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Provide and maintain emergency response services</li>
                      <li>Coordinate incident responses and dispatch personnel</li>
                      <li>Verify your identity and authorize access to the platform</li>
                      <li>Send you incident alerts and important notifications</li>
                      <li>Improve platform functionality and user experience</li>
                      <li>Comply with legal obligations and emergency protocols</li>
                      <li>Analyze usage patterns and generate reports</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">3. Information Sharing and Disclosure</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      We may share your information with:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>
                        <strong>Emergency Services:</strong> Your department, dispatchers, and
                        other authorized emergency personnel
                      </li>
                      <li>
                        <strong>Service Providers:</strong> Third-party vendors who help us
                        operate the platform
                      </li>
                      <li>
                        <strong>Legal Authorities:</strong> When required by law or to protect
                        rights and safety
                      </li>
                      <li>
                        <strong>Insurance Companies:</strong> When processing incident claims
                        with proper authorization
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      We do not sell your personal information to third parties.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">4. Location Data Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Location tracking is optional but recommended for optimal incident
                      coordination. When enabled, your real-time location is shared with
                      dispatchers and authorized personnel. You can disable location tracking at
                      any time in your profile settings. Historical location data is retained for
                      incident reporting and compliance purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">5. Data Security</h3>
                    <p className="text-sm text-muted-foreground">
                      We implement industry-standard security measures to protect your
                      information, including encryption, secure servers, and access controls.
                      However, no method of transmission over the internet is 100% secure, and we
                      cannot guarantee absolute security.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">6. Data Retention</h3>
                    <p className="text-sm text-muted-foreground">
                      We retain your personal information for as long as your account is active or
                      as needed to provide services. Incident reports and related data may be
                      retained longer for legal, regulatory, and safety purposes. You may request
                      deletion of your account and data, subject to legal retention requirements.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">7. Your Privacy Rights</h3>
                    <p className="text-sm text-muted-foreground mb-2">You have the right to:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                      <li>Access and review your personal information</li>
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Request deletion of your account and data</li>
                      <li>Opt out of certain data collection (e.g., location tracking)</li>
                      <li>Receive a copy of your data in a portable format</li>
                      <li>Object to certain processing of your information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">8. Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      We send push notifications for critical incident alerts and important
                      updates. You can manage notification preferences in your profile settings.
                      Note that disabling notifications may impact your ability to respond to
                      incidents in a timely manner.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">9. Children&apos;s Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      NFA Alerts is not intended for use by individuals under the age of 18. We
                      do not knowingly collect information from children. All users must be
                      authorized emergency response personnel.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">10. Changes to Privacy Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      We may update this Privacy Policy from time to time. We will notify you of
                      any material changes by posting the updated policy on the platform and
                      updating the &quot;Last Updated&quot; date. Continued use after changes constitutes
                      acceptance of the updated policy.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-2">11. Contact Us</h3>
                    <p className="text-sm text-muted-foreground">
                      For questions about this Privacy Policy or to exercise your privacy rights,
                      please contact us at:
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Email: privacy@nfaalerts.com</p>
                      <p>Phone: (800) 555-0123</p>
                      <p>Address: 123 Emergency Lane, Miami, FL 33131</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
