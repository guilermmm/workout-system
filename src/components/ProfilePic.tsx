import type { Session } from "next-auth";
import Image from "next/image";
import { useMemo } from "react";
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
  const initials = useMemo(
    () =>
      user &&
      (user.name ?? user.email!)
        .split(" ")
        .map(n => n[0]?.toLocaleUpperCase())
        .slice(0, 2)
        .join(""),
    [user],
  );

  return (
    <div
      className={classList("relative rounded-full bg-white", {
        "h-10 w-10": size === "sm",
        "h-12 w-12": size === "md",
        "h-16 w-16": size === "lg",
        "h-24 w-24": size === "xl",
      })}
    >
      <div className="rounded-inherit absolute inset-0 flex items-center justify-center text-xl font-bold dark:border-gray-800">
        {initials}
      </div>
      {(user?.image || !initials) && (
        <div
          className={classList("index-0 absolute z-10", {
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
            className={classList("rounded-full", {
              "h-10 w-10": size === "sm",
              "h-12 w-12": size === "md",
              "h-16 w-16": size === "lg",
              "h-24 w-24": size === "xl",
            })}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePic;
