import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { db } from "./firebase"
import GitHub from "next-auth/providers/github"

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET is required for Auth.js. Add it to .env.local (e.g. run: npm exec auth secret)"
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  adapter: FirestoreAdapter(db),
  trustHost: true,
})