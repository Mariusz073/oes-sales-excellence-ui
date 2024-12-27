import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "./lib/auth-config";
import HomePage from "./home-page";

export default async function Page() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/login");
  }

  return <HomePage isAdmin={session.user.isAdmin} />;
}
