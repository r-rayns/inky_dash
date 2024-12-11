/**
 * swcMinify is disabled temporally because the JIMP library is not compatible at the moment
 * https://github.com/jimp-dev/jimp/issues/1344
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  swcMinify: false,
};

export default nextConfig;
