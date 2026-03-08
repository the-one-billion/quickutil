import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – QuickUtil",
  description: "Privacy policy for QuickUtil. All tools run entirely in your browser — we never collect or upload your files.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 2026</p>

      <section className="space-y-8 text-sm leading-7 text-foreground/80">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Overview</h2>
          <p>
            QuickUtil is a collection of browser-based utility tools. All processing happens
            entirely on your device. We do not receive, store, or transmit any files or data
            you work with in our tools.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Data We Collect</h2>
          <p>
            We collect minimal anonymous usage data through analytics (page views, tool usage
            counts) to understand how the site is used and improve it. This data contains no
            personally identifiable information.
          </p>
          <p className="mt-2">We do <strong>not</strong> collect:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Files you process with any tool</li>
            <li>Content you paste or type into tools</li>
            <li>Your name, email, or any personal details</li>
            <li>Passwords or sensitive data entered into generators</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Cookies</h2>
          <p>
            We use a single cookie to remember your theme preference (light/dark mode). No
            tracking cookies or third-party cookies are set by default.
          </p>
          <p className="mt-2">
            If ads are displayed via Google AdSense, Google may set its own cookies subject
            to{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Google's Privacy Policy
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Third-Party Services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Vercel</strong> — hosts this site and may log standard HTTP request metadata (IP, user agent) per their privacy policy.</li>
            <li><strong>Google Analytics</strong> — anonymous usage analytics.</li>
            <li><strong>Google AdSense</strong> — may serve personalised ads based on your browsing history.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Your Files Stay on Your Device</h2>
          <p>
            All file operations (PDF merge, image compression, format conversion, etc.) are
            performed using browser APIs. Your files are never uploaded to any server.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. Changes</h2>
          <p>
            We may update this policy as the site evolves. Continued use of QuickUtil after
            changes constitutes acceptance of the updated policy.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">7. Contact</h2>
          <p>
            Questions? Reach out via the{" "}
            <a
              href="https://github.com/the-one-billion/quickutil/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              GitHub issues page
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
