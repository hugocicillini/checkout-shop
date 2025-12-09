import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const { name } = session.user;

  return (
    <div>
      <h1>Perfil</h1>
      <p>Bem-vindo, {name}!</p>
    </div>
  );
};

export default Profile;
