import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    phone?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      phone?: string | null;
    };
  }
}
