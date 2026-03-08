import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use – QuickUtil",
  description: "Terms of use for QuickUtil — free browser-based utility tools.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Terms of Use</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 2026</p>

      <section className="space-y-8 text-sm leading-7 text-foreground/80">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Acceptance</h2>
          <p>
            By using QuickUtil ("the Service"), you agree to these Terms of Use. If you do
            not agree, please discontinue use immediately.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Use of the Service</h2>
          <p>QuickUtil provides free, client-side utility tools. You may use the Service for:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Personal, educational, or commercial purposes</li>
            <li>Processing files entirely within your own browser</li>
          </ul>
          <p className="mt-2">You may <strong>not</strong>:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Attempt to disrupt, overload, or attack the Service</li>
            <li>Scrape or reproduce the Service for competing products</li>
            <li>Use the Service for any unlawful purpose</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. No Warranty</h2>
          <p>
            The Service is provided <strong>"as is"</strong> without warranty of any kind.
            We do not guarantee that tools will be error-free, accurate, or suitable for any
            particular purpose. Use at your own risk — always keep backups of important files
            before processing them.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, QuickUtil and its operators shall not be
            liable for any direct, indirect, incidental, or consequential damages arising from
            use of the Service, including data loss or file corruption.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Intellectual Property</h2>
          <p>
            The QuickUtil name, logo, and website design are owned by QuickUtil. The underlying
            source code is available on{" "}
            <a
              href="https://github.com/the-one-billion/quickutil"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              GitHub
            </a>
            . Third-party libraries used by the Service retain their respective licenses.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. Advertising</h2>
          <p>
            The Service may display advertisements served by Google AdSense or similar
            networks. These ads are subject to the respective network's terms and privacy policies.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">7. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Continued use of the
            Service after changes constitutes your acceptance of the revised Terms.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">8. Contact</h2>
          <p>
            Questions about these Terms? Open an issue on{" "}
            <a
              href="https://github.com/the-one-billion/quickutil/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
