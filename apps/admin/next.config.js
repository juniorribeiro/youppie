/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    // Only use standalone output in production
    ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
};

module.exports = nextConfig;

