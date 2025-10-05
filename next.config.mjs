/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Configure SVG file handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    return config;
  }
};

export default nextConfig;
