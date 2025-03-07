import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authConfig } from "../lib/auth-config";
import CreateUserForm from "./create-user-form";
import ManageUsers from "./manage-users";

export default async function AdminPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#1E1E1E] text-white p-8 font-normal">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="title font-bold">Admin Panel</h1>
          <Link href="/" className="button">
            Home Page
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <section className="mb-8 lg:mb-0">
            <h2 className="text-2xl font-semibold mb-6">Create New User</h2>
            <CreateUserForm />
          </section>
          <section>
            <ManageUsers />
          </section>
        </div>
      </div>
    </main>
  );
}
