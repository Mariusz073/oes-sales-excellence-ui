import { Metadata } from "next";
import LoginForm from "./login-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "../lib/auth-config";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect(searchParams?.callbackUrl || "/");
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center font-normal">
      <div className="w-full max-w-md p-8">
        <h1 className="title text-center mb-8">Sign in to your account</h1>
        <div>
          <LoginForm callbackUrl={searchParams?.callbackUrl} />
        </div>
      </div>
    </main>
  );
}
