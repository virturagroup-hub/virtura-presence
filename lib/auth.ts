import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { attachEmailOwnedRecordsToUser } from "@/lib/data/user-links";
import { prisma } from "@/lib/prisma";

export type AppRole = "CLIENT" | "CONSULTANT" | "ADMIN";

type DemoAuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AppRole;
  label: string;
};

export const demoAuthUsers: DemoAuthUser[] = [
  {
    id: "demo-consultant",
    name: "Virtura Consultant",
    email: process.env.DEMO_CONSULTANT_EMAIL ?? "consultant@virturagroup.com",
    password: process.env.DEMO_CONSULTANT_PASSWORD ?? "VirturaConsultant!2026",
    role: "CONSULTANT",
    label: "Consultant demo",
  },
  {
    id: "demo-client",
    name: "Harbor & Pine HVAC",
    email: process.env.DEMO_CLIENT_EMAIL ?? "client@virturapresence.com",
    password: process.env.DEMO_CLIENT_PASSWORD ?? "VirturaClient!2026",
    role: "CLIENT",
    label: "Client demo",
  },
];

export const demoAuthEnabled = process.env.ENABLE_DEMO_AUTH === "true";

function findDemoUser(email: string, password: string) {
  if (!demoAuthEnabled) {
    return null;
  }

  return demoAuthUsers.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  );
}

function normalizeRole(role: string | null | undefined): AppRole {
  if (role === "ADMIN" || role === "CONSULTANT" || role === "CLIENT") {
    return role;
  }

  return "CLIENT";
}

export function getDashboardPath(role?: AppRole) {
  if (role === "ADMIN" || role === "CONSULTANT") {
    return "/workspace";
  }

  return "/portal";
}

function getNextAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET is required in production. Add it to your Vercel environment variables before deploying Virtura Presence.",
    );
  }

  return "virtura-presence-dev-secret";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: getNextAuthSecret(),
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const demoUser = findDemoUser(email, password);

        if (demoUser) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          };
        }

        if (!process.env.DATABASE_URL) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user?.passwordHash) {
            return null;
          }

          const matches = await compare(password, user.passwordHash);

          if (!matches) {
            return null;
          }

          await attachEmailOwnedRecordsToUser(prisma, {
            userId: user.id,
            email: user.email,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: normalizeRole(user.role),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = normalizeRole(user.role);
        token.uid = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.uid ?? "");
        session.user.role = normalizeRole(
          typeof token.role === "string" ? token.role : undefined,
        );
      }

      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireRole(
  allowedRoles: AppRole[],
  callbackUrl?: string,
) {
  const user = await getCurrentUser();

  if (!user?.email) {
    const nextPath = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
    redirect(`/sign-in${nextPath}`);
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect(getDashboardPath(user.role));
  }

  return user;
}
