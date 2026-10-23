/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com'],
  },
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
