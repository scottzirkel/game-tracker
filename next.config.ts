import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/horizontal",
        destination: "/scoreboard",
        permanent: true,
      },
      {
        source: "/commander",
        destination: "/overwatch",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
