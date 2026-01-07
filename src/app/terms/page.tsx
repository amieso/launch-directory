"use client"

import { Header } from "@/components/layout/header"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Terms of Service</h1>

        <div className="space-y-6 text-sm text-muted leading-relaxed">
          <p className="text-muted-dark">Last updated: January 2025</p>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Lowkey, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">2. Description of Service</h2>
            <p>
              Lowkey is a curated platform for discovering product launch videos. We provide a
              collection of launch videos for inspiration and research purposes. We may modify,
              suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">3. User Accounts</h2>
            <p>
              To access certain features, you may need to create an account. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Scrape, harvest, or collect data without permission</li>
              <li>Upload malicious code or content</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">5. Intellectual Property</h2>
            <p>
              The videos featured on Lowkey are the property of their respective creators and companies.
              Lowkey curates and indexes these videos for discovery purposes. Our platform design,
              branding, and original content are owned by Lowkey.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">6. Submissions</h2>
            <p>
              If you submit videos or content to Lowkey, you represent that you have the right to
              share such content and grant us permission to display it on our platform. We reserve
              the right to accept or reject any submission at our discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">7. Disclaimer of Warranties</h2>
            <p>
              Lowkey is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
              that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Lowkey shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">9. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Lowkey after changes
              are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground">10. Contact</h2>
            <p>
              For questions about these terms, please contact us at{" "}
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
