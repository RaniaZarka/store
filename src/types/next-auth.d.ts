import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    lastName?: string | null;
    role?: "USER" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      lastName?: string | null;
      role?: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    lastName?: string | null;
    role?: "USER" | "ADMIN";
  }
}
