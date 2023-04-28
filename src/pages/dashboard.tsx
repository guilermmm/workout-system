import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
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
import { classList, useClickOutside, useEndOfScroll, validateEmail } from "../utils";
import { api } from "../utils/api";
import PlusIcon from "../components/icons/PlusIcon";
import Alert from "../components/Alert";
import XMarkIcon from "../components/icons/XMarkIcon";
import CheckIcon from "../components/icons/CheckIcon";

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 150);

  const [showMutateAlert, setShowMutateAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const profiles = api.user.searchProfiles.useInfiniteQuery(
    { search: debouncedInput },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
      onSuccess: () => void createProfile.reset(),
    },
  );

  const showAddButton = !profiles.isLoading && !profiles.data?.pages[0]?.items[0];

  const ref = useRef<HTMLDivElement>(null);

  const errorRef = useClickOutside<HTMLDivElement>(() => setShowErrorAlert(false));

  const mutationRef = useClickOutside<HTMLDivElement>(() => setShowMutateAlert(false));

  useEndOfScroll(ref, () => {
    if (profiles.hasNextPage && !profiles.isFetching) {
      void profiles.fetchNextPage();
    }
  });

  const createProfile = api.user.createProfile.useMutation({
    onSuccess: () => void profiles.refetch().then(() => setShowMutateAlert(false)),
  });

  if (profiles.error) {
    return <ErrorPage />;
  }

  return (
    <FullPage>
      {showErrorAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="E-mail inválido"
          text="Digite um e-mail válido para cadastrar um novo usuário."
          ref={errorRef}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setShowMutateAlert(false)}
          >
            OK
          </button>
        </Alert>
      )}
      {showMutateAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Confirmar cadastro"
          text={`Tem certeza que deseja cadastrar o novo usuário ${searchInput}?`}
          ref={mutationRef}
        >
          {createProfile.isLoading ? (
            <div className="flex h-full items-center justify-center overflow-y-hidden">
              <Spinner className="h-24 w-24 fill-blue-600 text-gray-200" />
            </div>
          ) : createProfile.isSuccess ? (
            <div className="flex h-full items-center justify-center overflow-y-hidden">
              <CheckIcon className="h-24 w-24 rounded-full bg-green-300 p-2 text-green-600" />
            </div>
          ) : createProfile.isError ? (
            <div className="flex h-full items-center justify-center overflow-y-hidden">
              <XMarkIcon className="h-24 w-24 rounded-full bg-red-200 p-2 text-red-600" />
            </div>
          ) : (
            <Fragment>
              <button
                className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md"
                onClick={() => createProfile.mutate({ email: searchInput })}
              >
                Sim
              </button>
              <button
                className="rounded-md border-1 bg-red-500 py-2 px-4 text-white shadow-md"
                onClick={() => setShowMutateAlert(false)}
              >
                Não
              </button>
            </Fragment>
          )}
        </Alert>
      )}

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
          {showAddButton && (
            <div className="flex flex-row items-center justify-center">
              <button
                className="mt-2 flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-500 px-6 py-2 font-medium text-white hover:border-blue-600 hover:bg-blue-600 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
                onClick={() =>
                  validateEmail(searchInput) ? setShowMutateAlert(true) : setShowErrorAlert(true)
                }
              >
                Adicionar novo usuário
                <PlusIcon className="h-8 w-8" />
              </button>
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
