import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import AdminNavbar from "../components/AdminNavbar";
import ErrorPage from "../components/ErrorPage";
import Spinner from "../components/Spinner";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import MagnifyingGlassIcon from "../components/icons/MagnifyingGlassIcon";
import { env } from "../env/server.mjs";
import { getServerAuthSession } from "../server/auth";
import { api } from "../utils/api";

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 500);

  const profiles = api.user.searchProfiles.useQuery(debouncedInput);

  if (profiles.error) {
    return <ErrorPage />;
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={session?.user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{session?.user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => void signOut()}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        <div className="mx-4 flex h-full flex-1 grow flex-col gap-4">
          <div className="relative my-2">
            <input
              type="text"
              className="h-12 w-full rounded-full border-2 pl-4 pr-12"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
          </div>
          {profiles.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row">
              {profiles.data.map(profile => (
                <UserCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AdminNavbar />
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

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
