import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import User from "@/models/User";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connect from "@/utils/db";

export const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      CredentialsProvider({
        id: "credentials",
        name: "Credentials",
        async authorize(credentials) {
          await connect();
          try {
            const user = await User.findOne({ email: credentials.email });
            if (user) {
              const isPasswordCorrect = await bcrypt.compare(
                credentials.password,
                user.password
              );
              if (isPasswordCorrect) {
                return user;
              } else {
                throw new Error("wrong credentials");
              }
            } else {
              throw new Error("user not found");
            }
          } catch (err) {
            throw new Error(err);
          }
        },
      }),
    ],
    pages: {
      error: "/cart/login"
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };