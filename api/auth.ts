import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // 基础配置
  baseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  // 数据库配置
  database: {
    type: "sqlite",
    url: process.env.DATABASE_URL,
  },

  // 认证方法配置
  emailAndPassword: {
    enabled: true,
  },

  // 社交登录配置
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});
