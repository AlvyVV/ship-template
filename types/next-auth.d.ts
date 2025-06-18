import "next-auth";

declare module "next-auth" {
  interface JWT {
    user?: {
      uuid?: string;
      nickname?: string;
      avatarUrl?: string;
      createdAt?: string;
    };
  }

  interface Session {
    user: {
      uuid?: string;
      nickname?: string;
      avatarUrl?: string;
      createdAt?: string;
    } & DefaultSession["user"];
  }
}
