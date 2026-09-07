import UsersExplorer from "@/components/users/UsersExplorer";
import { mockUsers } from "@/lib/mocks/users";

export default function UsuariosPage() {
  return <UsersExplorer initialUsers={mockUsers} />;
}
