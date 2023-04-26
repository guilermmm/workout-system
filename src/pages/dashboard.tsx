import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import ErrorPage from "../components/ErrorPage";
import FullPage from "../components/FullPage";
import ProfilePic from "../components/ProfilePic";
import Spinner from "../components/Spinner";
import Header from "../components/admin/Header";
import AdminNavbar from "../components/admin/Navbar";
import MagnifyingGlassIcon from "../components/icons/MagnifyingGlassIcon";
import { env } from "../env/server.mjs";
import { getServerAuthSession } from "../server/auth";
import { classList, useEndOfScroll } from "../utils";
import { api } from "../utils/api";

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 150);

  const profiles = api.user.searchProfiles.useInfiniteQuery(
    { search: debouncedInput },
    { getNextPageParam: lastPage => lastPage.nextCursor },
  );

  const ref = useRef<HTMLDivElement>(null);

  useEndOfScroll(ref, () => {
    if (profiles.hasNextPage && !profiles.isFetching) {
      void profiles.fetchNextPage();
    }
  });

  if (profiles.error) {
    return <ErrorPage />;
  }

  return (
    <FullPage>
      <Header user={session?.user} />
      <div className="m-2">
        <div className="relative">
          <input
            type="text"
            className="h-12 w-full rounded-full border-2 pl-4 pr-12"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
        </div>
      </div>
      <div className="grow overflow-y-scroll" ref={ref}>
        <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
          {!profiles.data && profiles.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <div className="flex w-full max-w-[32rem] flex-col gap-1 pb-4">
              {profiles.data.pages.flatMap(({ items }) =>
                items.map(profile => <UserCard key={profile.id} profile={profile} />),
              )}
            </div>
          )}
        </div>
      </div>
      <AdminNavbar />
    </FullPage>
  );
};

const UserCard = ({ profile }: { profile: Profile & { user: User | null } }) => {
  return (
    <Link
      href={`/manage/${profile.id}`}
      className="flex w-full grow flex-row items-center justify-between rounded-md bg-slate-50 shadow-md transition-shadow hover:shadow-xl"
    >
      <div className="flex grow items-center truncate p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <ProfilePic user={profile.user} size="md" />
        </div>
        <div className="ml-4 truncate">
          <div className="truncate text-lg font-medium text-slate-800">{profile.user?.name}</div>
          <div className="truncate text-sm text-slate-500">{profile.email}</div>
        </div>
      </div>
      <div
        className={classList("h-full w-3 rounded-r-md", {
          "bg-green-500": profile.isActive,
          "bg-red-500": !profile.isActive,
        })}
      />
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
