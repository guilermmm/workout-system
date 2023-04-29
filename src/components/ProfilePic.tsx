import type { Session } from "next-auth";
import Image from "next/image";
import { classList } from "../utils";

const ProfilePic = ({
  size,
  user,
  alt,
}: {
  size: "sm" | "md" | "lg" | "xl";
  user?: Pick<Session["user"], "name" | "email" | "image"> | null;
  alt?: string;
}) => {
  return (
    <div className="rounded-full bg-white">
      <div
        className={classList({
          "h-10 w-10": size === "sm",
          "h-12 w-12": size === "md",
          "h-16 w-16": size === "lg",
          "h-24 w-24": size === "xl",
        })}
      >
        <Image
          src={user?.image ?? "/google.svg"}
          alt={alt ?? `Foto de perfil de ${user?.name ?? user?.email ?? "usuário"}`}
          width={size === "sm" ? 40 : size === "md" ? 48 : size === "lg" ? 64 : 96}
          height={size === "sm" ? 40 : size === "md" ? 48 : size === "lg" ? 64 : 96}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default ProfilePic;
