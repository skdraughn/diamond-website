import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path((?!\\.well-known(?:/|$)|apple-app-site-association$).*)",
        has: [{ type: "host", value: "diamondtrivia.app" }],
        destination: "https://www.diamondtrivia.app/:path",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
