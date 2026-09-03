/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@clip/ui", "@clip/types", "@clip/config", "@clip/utilities"],
};

module.exports = nextConfig;
