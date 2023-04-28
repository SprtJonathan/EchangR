module.exports = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/users/id-:user_id",
        destination: "/api/users/id-[user_id]",
      },
      {
        source: "/api/users/username-:username",
        destination: "/api/users/username-[username]",
      },
    ];
  },
};
