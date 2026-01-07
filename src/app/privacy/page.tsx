"use client"

import { Header } from "@/components/layout/header"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-muted leading-relaxed">
          <p className="text-muted-dark">Last updated: January 2025</p>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">1. Information We Collect</h2>
            <p>
              When you use Lowkey, we may collect information you provide directly, such as your email address
              when you create an account, and information about how you interact with our service.
            </p>
            <p>
              We automatically collect certain technical information, including your IP address, browser type,
              and device information to help improve our service and ensure security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide, maintain, and improve Lowkey</li>
              <li>Create and manage your account</li>
              <li>Send you updates and notifications (if you opt in)</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">3. Cookies</h2>
            <p>
              We use cookies and similar technologies to keep you logged in, remember your preferences,
              and understand how you use our service. You can control cookie settings through your browser,
              though some features may not work properly if you disable cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with third-party
              service providers who help us operate Lowkey (such as hosting and analytics), but only
              as necessary for them to perform their services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method
              of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">6. Your Rights</h2>
            <p>
              You can access, update, or delete your account information at any time. If you wish to
              delete your account entirely, please contact us at{" "}
              <a href="mailto:hello@lowkey.so" className="text-foreground hover:underline">
                hello@lowkey.so
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">8. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at{" "}
              <a href="mailto:hello@lowkey.so" className="text-foreground hover:underline">
                hello@lowkey.so
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
