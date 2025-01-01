import "next-auth";
import { User as DbUser } from "../db/postgres";
import { UserPrivileges } from "./types";

declare module "next-auth" {
  interface User extends DbUser {
    privileges: UserPrivileges;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
      privileges: UserPrivileges;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean;
    username: string;
    privileges: UserPrivileges;
  }
}
