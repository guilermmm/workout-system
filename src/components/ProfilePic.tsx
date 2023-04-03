import type { Session } from "next-auth";
import Image from "next/image";

const ProfilePic = ({
  size,
  user,
  alt,
}: {
  size: "sm" | "md" | "lg";
  user?: Pick<Session["user"], "name" | "email" | "image"> | null;
  alt?: string;
}) => {
  return (
    <div className="rounded-full bg-white">
      <div className={size === "sm" ? "h-10 w-10" : size === "md" ? "h-12 w-12" : "h-16 w-16"}>
        <Image
          src={user?.image ?? "/google.svg"}
          alt={alt ?? `Foto de perfil de ${user?.name ?? user?.email ?? "usuário"}`}
          width={size === "sm" ? 40 : size === "md" ? 48 : 64}
          height={size === "sm" ? 40 : size === "md" ? 48 : 64}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default ProfilePic;
