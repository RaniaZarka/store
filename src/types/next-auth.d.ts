import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    lastName?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    lastName?: string | null;
  }
}
