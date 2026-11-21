/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [128, 256, 384, 480],
    qualities: [75, 82],
  },
};
