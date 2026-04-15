import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: "CLIENT" | "CONSULTANT" | "ADMIN";
    };
  }

  interface User {
    role?: "CLIENT" | "CONSULTANT" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "CLIENT" | "CONSULTANT" | "ADMIN";
  }
}
