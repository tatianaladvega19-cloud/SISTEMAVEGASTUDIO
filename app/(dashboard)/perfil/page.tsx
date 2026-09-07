import PageHeader from "@/components/layout/PageHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";

export default function PerfilPage() {
  return (
    <div>
      <PageHeader
        title="Mi perfil"
        description="Gestiona tu información personal y seguridad."
      />

      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
