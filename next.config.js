/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Assegura que els .md de content/ viatgen amb les funcions serverless
  // (es llegeixen amb fs via ruta calculada, que el tracing no detecta).
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
};

module.exports = nextConfig;
