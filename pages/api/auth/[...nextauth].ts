import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const allowedUsers = ["Gram012", "mssgill", "patkel"]; // Hardcoded allowlist

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            const githubProfile = profile as { login?: string };

            console.log("[NextAuth] GitHub profile:", githubProfile);

            if (!githubProfile?.login) {
                console.warn("[NextAuth] No login field found.");
                return false;
            }

            const isAllowed = allowedUsers.includes(githubProfile.login);
            console.log(`[NextAuth] Is ${githubProfile.login} allowed?`, isAllowed);

            return isAllowed;
        },

        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.accessToken = account.access_token;
                token.login = (profile as any).login;
            }

            if (typeof token.login === "string") {
                token.role = allowedUsers.includes(token.login) ? "admin" : "user";
            } else {
                token.role = "user";
            }

            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.login = token.login as string;
            session.user.role = token.role as "admin" | "user";
            return session;
        },
    },
});
