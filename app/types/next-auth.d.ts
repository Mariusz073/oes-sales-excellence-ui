import "next-auth";
import { User as DbUser } from "../SQLite/db";

declare module "next-auth" {
  interface User extends DbUser {}

  interface Session {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean;
    username: string;
  }
}
