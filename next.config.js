/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Assegura que els .md de content/ viatgen amb les funcions serverless
  // (es llegeixen amb fs via ruta calculada, que el tracing no detecta).
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // Ignora carpeta antiga (shop) que causa permisos de Windows
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.next', '**/src/app/(shop)/**'],
    };
    return config;
  },
};

module.exports = nextConfig;
