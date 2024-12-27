// next.config.mjs
import CopyPlugin from 'copy-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'team_reports',
              to: 'team_reports'
            },
            {
              from: 'json_reports',
              to: 'json_reports'
            }
          ],
        })
      );
    }
    return config;
  }
}

export default nextConfig;