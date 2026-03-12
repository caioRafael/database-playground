import { betterAuth } from "better-auth";
import { db } from "./firebase";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const ref = db.collection("users").doc(user.id);
          const doc = await ref.get();

          if (!doc.exists) {
            await ref.set({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              // créditos iniciais para usar a IA de geração de banco
              credits: 5,
              createdAt: new Date(),
            });
          } else {
            // garante que usuários antigos também tenham o campo de créditos
            const data = doc.data() || {};
            if (typeof data.credits !== "number") {
              await ref.update({
                credits: 5,
              });
            }
          }
        },
      },
    },
  },
});