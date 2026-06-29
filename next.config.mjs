import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
