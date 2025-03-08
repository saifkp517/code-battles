import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
        // ...add more providers here
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.id = profile.sub; // Google unique ID
                token.accessToken = account.access_token;
                token.name = profile.name;
                token.email = profile.email;
                token.image = profile.picture;
            }

            return token;
        },
        async session({ session, token }) {
            // Add custom fields to the session
            session.user.id = token.id;
            session.user.accessToken = token.accessToken;
            return session;
        },
    }
}
export default NextAuth(authOptions)