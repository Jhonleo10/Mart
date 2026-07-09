import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    sessionVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    sessionVersion?: number;
    userSessionId?: string;
  }
}

export type { Role };
