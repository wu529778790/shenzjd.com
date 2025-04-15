import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      login: string;
      provider: string;
    };
    accessToken: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
    provider?: string;
  }
}
