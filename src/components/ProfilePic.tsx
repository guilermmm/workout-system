import type { Session } from "next-auth";
import Image from "next/image";

const ProfilePic = ({
  size,
  user,
}: {
  size: "sm" | "md";
  user?: Pick<Session["user"], "name" | "email" | "image"> | null;
}) => {
  return (
    <div className="rounded-full bg-gray-50">
      <div className={size === "sm" ? "h-12 w-12" : "h-16 w-16"}>
        <Image
          src={user?.image ?? "/google.svg"}
          alt={`Foto de perfil de ${user?.name ?? user?.email ?? "usuário"}`}
          width={size === "sm" ? 48 : 64}
          height={size === "sm" ? 48 : 64}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default ProfilePic;
