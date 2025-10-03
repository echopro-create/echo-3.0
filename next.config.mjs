/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Разрешаем микрофон на своём домене, остальное остаётся запрещённым
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
