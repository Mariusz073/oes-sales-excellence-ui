import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbOperations } from "../SQLite/db";

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

        return {
          id: user.id.toString(),
          username: user.username,
          isAdmin: user.isAdmin
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          isAdmin: token.isAdmin as boolean,
          username: token.username as string
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};
