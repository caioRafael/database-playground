import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { ProfileClient } from "../../../components/feature/profile/profile-client";
import { ProfileLogin } from "../../../components/feature/profile/profile-login";

async function getUserCredits(userId: string) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  const data = doc.data() || {};

  const credits = typeof data.credits === "number" ? data.credits : 0;

  return credits;
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user || !session.user.id) {
    return <ProfileLogin />;
  }

  const credits = await getUserCredits(session.user.id);

  return (
    <ProfileClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      initialCredits={credits}
    />
  );
}
