import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Only add Google provider if credentials are configured
const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// If no providers are configured, NextAuth will still work but won't have any auth providers
// This prevents errors when Google OAuth is not configured
const { handlers } = NextAuth({
  providers: providers.length > 0 ? providers : [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = (account as any).access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
});

export const { GET, POST } = handlers;
