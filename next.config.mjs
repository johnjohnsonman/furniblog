/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/products/herman-miller-aeron-b",
        destination: "/products/herman-miller-aeron",
        permanent: true,
      },
      {
        source: "/products/herman-miller-aeron-c",
        destination: "/products/herman-miller-aeron",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
