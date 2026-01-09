/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DAILY_API_KEY: process.env.DAILY_API_KEY,
  },
};

module.exports = nextConfig;
