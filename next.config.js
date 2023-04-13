module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: '',
        pathname: '/**',
      },
    ],
  },
};
