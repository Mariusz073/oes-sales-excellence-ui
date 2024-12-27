import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "../lib/auth-config";
import CreateUserForm from "./create-user-form";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E] text-white p-8 font-normal">
      <div className="max-w-7xl mx-auto">
        <h1 className="title font-bold">Admin Panel</h1>
        <div className="mt-8">
          <section>
            <h2 className="text-xl font-bold mb-6">Create New User</h2>
            <CreateUserForm />
          </section>
        </div>
      </div>
    </main>
  );
}
