/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //webpack5: false,
  webpack: (config) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true
    };
    config.resolve.fallback = { fs: false };
    return config;
  }
}

module.exports = nextConfig
