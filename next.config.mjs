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
      // 2026-09-12 hygiene: published posts that had auto-generated slugs.
      {
        source: "/blog/untitled-post-mr8ztshk",
        destination: "/blog/orgatec-tokyo-2026-kokuyo-c15-full-mesh-chair",
        permanent: true,
      },
      {
        source: "/blog/untitled-post-mraabycx",
        destination: "/blog/why-serial-number-authentication-matters-for-high-end-office-chairs",
        permanent: true,
      },
      {
        source: "/blog/untitled-post-mrj00095",
        destination: "/blog/full-mesh-vs-padded-mesh-office-chairs-summer-seating-guide",
        permanent: true,
      },
      {
        source: "/chairpedia/sihoo-m18",
        destination: "/chairpedia/sihoo-m18-ergonomic-office-chair",
        permanent: true,
      },
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
