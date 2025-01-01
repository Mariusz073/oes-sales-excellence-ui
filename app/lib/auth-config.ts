import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbOperations } from "../SQLite/db";
import { UserPrivileges } from "../types/types";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = dbOperations.getUserByUsername(credentials.username);
        if (!user) {
          return null;
        }

        const isValid = dbOperations.verifyPassword(user, credentials.password);
        if (!isValid) {
          return null;
        }

        // Get user privileges
        const privileges = dbOperations.getUserPrivileges(user.id);

        return {
          id: user.id.toString(),
          username: user.username,
          isAdmin: user.isAdmin,
          privileges
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.username = user.username;
        token.privileges = user.privileges;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          isAdmin: token.isAdmin as boolean,
          username: token.username as string,
          privileges: token.privileges as UserPrivileges
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};
