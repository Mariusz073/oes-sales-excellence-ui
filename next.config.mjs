/** @type {import('next').NextConfig} */
const nextConfig = {
  // Copy additional files/directories to the server build
  serverComponentsExternalPackages: ['team_reports', 'json_reports'],
  // Explicitly include files/directories in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.copy = config.copy || [];
      config.copy.push(
        {
          from: 'team_reports',
          to: 'team_reports'
        },
        {
          from: 'json_reports',
          to: 'json_reports'
        }
      );
    }
    return config;
  }
}

export default nextConfig;