import { useState } from "react";
import { useDebounce } from "use-debounce";
import { api } from "../utils/api";
import { Profile, User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

const ManagementTab = () => {
  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 500);

  const [profiles] = api.user.searchProfiles.useSuspenseQuery(debouncedInput);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative my-2">
        <input
          type="text"
          className="h-12 w-full rounded-full border-2 pl-4 pr-12"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute right-4 top-3 h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row">
        {profiles.map(profile => (
          <UserCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

const UserCard = ({ profile }: { profile: Profile & { user: User | null } }) => {
  return (
    <Link
      href={`/manage/${profile.id}`}
      className="flex flex-1 flex-row items-center rounded-md bg-slate-50 p-3 shadow-md transition-shadow hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Image
          width={48}
          height={48}
          alt={`Foto de perfil de ${profile.user?.name ?? profile.email}`}
          src={profile.user?.image ?? "./google.svg"}
          className="h-12 w-12 rounded-full"
        />
      </div>
      <div className="ml-4">
        <div className="truncate text-lg font-medium text-slate-800">{profile.user?.name}</div>
        <div className="truncate text-sm text-slate-500">{profile.email}</div>
      </div>
    </Link>
  );
};

export default ManagementTab;
