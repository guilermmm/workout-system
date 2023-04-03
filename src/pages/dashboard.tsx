import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import AdminNavbar from "../components/AdminNavbar";
import ErrorPage from "../components/ErrorPage";
import ProfilePic from "../components/ProfilePic";
import Spinner from "../components/Spinner";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import CheckCircleIcon from "../components/icons/CheckCircleIcon";
import MagnifyingGlassIcon from "../components/icons/MagnifyingGlassIcon";
import XCircleIcon from "../components/icons/XCircleIcon";
import { env } from "../env/server.mjs";
import { getServerAuthSession } from "../server/auth";
import useEndOfScroll, { classList, useOutsideClick } from "../utils";
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
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <ProfilePic user={session?.user} size="md" />
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
      <div className="m-2 flex h-full flex-1 grow flex-col gap-4">
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
        <div className="mx-4 flex h-full flex-1 grow flex-col gap-4">
          {!profiles.data && profiles.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <div className="flex flex-col flex-wrap items-stretch gap-2 pb-4 sm:flex-row">
              {profiles.data.pages.flatMap(({ items }) =>
                items.map(profile => (
                  <UserCard
                    key={profile.id}
                    profile={profile}
                    refetch={async () => void (await profiles.refetch())}
                  />
                )),
              )}
            </div>
          )}
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
};

const UserCard = ({
  profile,
  refetch,
}: {
  profile: Profile & { user: User | null };
  refetch: () => Promise<void>;
}) => {
  return (
    <div
      className={`flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-slate-50 shadow-md transition-shadow hover:shadow-xl`}
    >
      <Link href={`/manage/${profile.id}`} className="flex grow items-center truncate p-3 pr-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <ProfilePic user={profile.user} size="md" />
        </div>
        <div className="ml-4 truncate">
          <div className="truncate text-lg font-medium text-slate-800">{profile.user?.name}</div>
          <div className="truncate text-sm text-slate-500">{profile.email}</div>
        </div>
      </Link>
      <StatusButton isActive={profile.isActive} id={profile.id} refetch={refetch} />
    </div>
  );
};

const StatusButton = ({
  isActive,
  id,
  refetch,
}: {
  isActive: boolean;
  id: string;
  refetch: () => Promise<void>;
}) => {
  const [opened, setOpened] = useState(false);
  const changeStatus = isActive
    ? api.user.deactivate.useMutation()
    : api.user.activate.useMutation();

  const ref = useOutsideClick<HTMLDivElement>(() => setOpened(false));

  return (
    <div
      className={classList("group h-full transition-all", {
        "pl-0": opened,
        "pl-8": !opened,
      })}
      onClick={() => setOpened(true)}
      onMouseEnter={() => setOpened(true)}
      onMouseLeave={() => setOpened(false)}
      ref={ref}
    >
      <div
        className={classList(
          "flex h-full items-center justify-center overflow-x-hidden rounded-r-md transition-all",
          {
            "w-[72px] rounded-l-md": opened,
            "w-3": !opened,
            "bg-green-500": isActive,
            "bg-red-500": !isActive,
          },
        )}
      >
        <button
          className={classList("rounded-full transition-all", {
            "bg-white": opened,
            "m-3": !opened,
            "m-1.5 p-1.5": opened,
          })}
          onClick={() =>
            changeStatus.mutate(
              { profileId: id },
              {
                onSuccess: () => {
                  void refetch();
                  setOpened(false);
                },
              },
            )
          }
        >
          {isActive ? (
            <XCircleIcon
              className={classList("text-red-500 transition-all", {
                "h-0 w-0": !opened,
                "h-10 w-10": opened,
              })}
            />
          ) : (
            <CheckCircleIcon
              className={classList("text-green-500 transition-all", {
                "h-0 w-0": !opened,
                "h-10 w-10": opened,
              })}
            />
          )}
        </button>
      </div>
    </div>
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
