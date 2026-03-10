import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // All tools are fully client-side; no server actions needed for tools.
  // SSG is used for the landing page and tool pages.
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  async headers() {
    return [
      {
        // Allow the site to be embedded in the Chrome extension side panel.
        // CSP frame-ancestors supersedes X-Frame-Options for modern browsers.
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' chrome-extension:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
