import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectToDatabase();
        } catch (err) {
          console.error("[AUTH] MongoDB connection failed:", err);
          throw new Error("Database unavailable. Check your network or MongoDB Atlas IP whitelist.");
        }

        const user = await User.findOne({ email: credentials.email }).lean() as {
          _id: { toString(): string };
          name: string;
          email: string;
          password?: string;
        } | null;

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      // If signing in with Google, upsert user in DB
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectToDatabase();
          const existing = await User.findOne({ email: profile.email });
          if (!existing) {
            const newUser = await User.create({
              name: profile.name ?? profile.email,
              email: profile.email,
              password: "", // no password for OAuth users
            });
            token.id = newUser._id.toString();
          } else {
            token.id = existing._id.toString();
          }
        } catch (err) {
          console.error("[AUTH] Google callback DB error:", err);
          // Still allow the session — just without a DB-linked ID
          token.id = profile.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
