import { redirect } from "next/navigation";
import UsersExplorer from "@/components/users/UsersExplorer";
import { getAuthenticatedProfile } from "@/lib/auth/require-admin";
import { listUsers } from "@/lib/data/users-store";

export default async function UsuariosPage() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "ADMIN" || !profile.isActive) {
    redirect("/dashboard");
  }

  const users = await listUsers();

  return <UsersExplorer initialUsers={users} />;
}
