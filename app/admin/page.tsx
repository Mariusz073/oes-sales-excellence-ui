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
    <div className="min-h-screen bg-[#1E1E1E] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#252525] shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Create New User</h2>
              <CreateUserForm />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
