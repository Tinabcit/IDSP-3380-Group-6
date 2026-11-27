import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "dev@example.com" },
      },
      async authorize(credentials) {
        return {
          id: "1",
          name: "Test User",
          email: (credentials?.email as string) || "dev@example.com",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
});
