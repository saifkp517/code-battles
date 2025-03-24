import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    if (res.data.user) return res.data.user;
                    return null;
                } catch (error) {
                    console.error("Login failed", error);
                    return null;
                }
            },
        }),
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
            },
        })
        // ...add more providers here
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === 'google') {
                try {
                    const { data } = await axios.post(`${process.env.BACKEND_URL}/auth/google-oauth`, {
                        email: user.email,
                        name: user.name,
                    });

                    return true; // Allow login
                } catch (error) {
                    console.error("Error storing Google user:");
                    return false; // Deny login if error occurs
                }
            }
            return true;
        },
        async jwt({ token, account, user }) {
            if (account) {
                token.accessToken = account.access_token;
            } else if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.accessToken = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.token = token.accessToken;
            return session;
        },
        secret: "test"
    }
}
export default NextAuth(authOptions)