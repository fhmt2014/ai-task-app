// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async authorized({ auth }) {
      return !!auth; // 未登录用户访问匹配路由会被重定向到登录页
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // 把用户 ID 注入 session
      }
      return session;
    },
  },
});
