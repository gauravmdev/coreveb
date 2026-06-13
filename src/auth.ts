import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  // Google verifies emails, so linking by email to an existing (invited)
  // account is safe and lets pre-invited clients sign in with Google.
  providers.push(Google({ allowDangerousEmailAccountLinking: true }));
}

if (process.env.AUTH_DEV_LOGIN === "true") {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev login",
      credentials: { email: { label: "Email", type: "email" } },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "")
          .trim()
          .toLowerCase();
        if (!email || !email.includes("@")) return null;

        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) {
          const adminEmail = (
            process.env.ADMIN_EMAIL ?? "admin@coreveb.com"
          ).toLowerCase();
          [user] = await db
            .insert(users)
            .values({
              email,
              name: email.split("@")[0],
              role: email === adminEmail ? "admin" : "client",
            })
            .returning();
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    // Gate who may sign in, and keep the admin account promoted.
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      if (!email) return false;
      const adminEmail = (
        process.env.ADMIN_EMAIL ?? "admin@coreveb.com"
      ).toLowerCase();

      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      // The configured admin is always allowed and (re)promoted to admin.
      if (email === adminEmail) {
        if (dbUser) {
          await db
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.id, dbUser.id));
        }
        return true;
      }

      // Otherwise only allow existing admins and admin-invited clients
      // (a client is "invited" once linked to a company).
      if (dbUser && (dbUser.role === "admin" || dbUser.companyId)) return true;

      return false; // unknown / uninvited → denied
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = String(token.id);
      return session;
    },
  },
  events: {
    // Promote the admin account AFTER the user is persisted — covers brand-new
    // OAuth users, where the signIn callback runs before the record exists.
    async signIn({ user }) {
      const email = (user.email ?? "").toLowerCase();
      const adminEmail = (
        process.env.ADMIN_EMAIL ?? "admin@coreveb.com"
      ).toLowerCase();
      if (user.id && email === adminEmail) {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
      }
    },
  },
});
