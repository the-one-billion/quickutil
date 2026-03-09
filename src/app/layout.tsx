import type { Metadata, Viewport } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import "./globals.css";

// Primary UI font — labels, buttons, body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Heading font — H1–H3. Manrope is the closest Google Fonts equivalent to SF Pro Display.
// On Apple devices, SF Pro Display loads via the system-ui stack automatically.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Monospace — JSON, hashes, code output
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quickutil.io"),
  title: {
    default: "QuickUtil – Free Online Tools",
    template: "%s | QuickUtil",
  },
  description:
    "40+ free browser-based tools: PDF merge, image compress, BMI calculator, QR generator, and more. No upload, 100% private.",
  keywords: [
    "free online tools", "pdf merge", "image compressor", "bmi calculator",
    "qr code generator", "unit converter", "word counter", "password generator",
  ],
  authors: [{ name: "QuickUtil" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quickutil.io",
    siteName: "QuickUtil",
    title: "QuickUtil – 40+ Free Browser Tools",
    description: "PDF, Image, Calculator & more — 100% client-side, no uploads needed.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickUtil – Free Online Tools",
    description: "PDF, Image, Calculator & more — 100% client-side, no uploads needed.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "AuHLcJfWeP7R5_Tm94r5soVWZW37K84ahu1gr6bhGtM",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0f1e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HRZ61PLE02" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-HRZ61PLE02');`,
          }}
        />
        {/* Google AdSense — uncomment and replace ca-pub-XXXXXXXX when approved */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossOrigin="anonymous" /> */}
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${jetbrains.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-muted/30 py-8 text-center text-xs text-muted-foreground">
              <p>
                © {new Date().getFullYear()} QuickUtil · All tools run in your browser — your
                files never leave your device.
              </p>
              <p className="mt-1">
                <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  Privacy
                </a>{" "}
                ·{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                  Terms
                </a>
              </p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
