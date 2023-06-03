import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import Alert from "../components/Alert";
import FullPage from "../components/FullPage";
import Modal from "../components/Modal";
import ProfilePic from "../components/ProfilePic";
import QueryErrorAlert from "../components/QueryErrorAlert";
import Spinner from "../components/Spinner";
import TextInput from "../components/TextInput";
import Header from "../components/admin/Header";
import AdminNavbar from "../components/admin/Navbar";
import CheckIcon from "../components/icons/CheckIcon";
import MagnifyingGlassIcon from "../components/icons/MagnifyingGlassIcon";
import XMarkIcon from "../components/icons/XMarkIcon";
import { env } from "../env/server.mjs";
import { getServerAuthSession } from "../server/auth";
import { classList, useEndOfScroll, useFormValidation, validateEmail } from "../utils";
import { api } from "../utils/api";

const Dashboard = ({ isSuperUser }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: session } = useSession();

  api.user.getAdminProfileBySession.useQuery();

  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 150);

  const [showMutateAlert, setShowMutateAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const profiles = api.user.searchProfiles.useInfiniteQuery(
    { search: debouncedInput },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    },
  );

  const ref = useEndOfScroll<HTMLDivElement>(() => {
    if (profiles.hasNextPage && !profiles.isFetching) {
      void profiles.fetchNextPage();
    }
  });

  const createProfile = api.user.createProfile.useMutation({
    onSuccess: () => {
      void profiles.refetch();
      setShowMutateAlert(false);
    },
  });

  const [showModal, setShowModal] = useState(false);

  const [email, setEmail] = useState("");

  const [emailProps] = useFormValidation(
    email,
    v => {
      if (!validateEmail(v)) {
        return "E-mail inválido";
      }
    },
    false,
  );

  return (
    <FullPage>
      <QueryErrorAlert queries={[profiles]} />
      {showErrorAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="E-mail inválido"
          text="Digite um e-mail válido para cadastrar um novo usuário."
          onClickOutside={() => setShowErrorAlert(false)}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setShowMutateAlert(false)}
          >
            OK
          </button>
        </Alert>
      )}
      {showModal && (
        <Modal
          onClickOutside={() => setShowModal(false)}
          buttons={
            <>
              <button
                onClick={() => setShowMutateAlert(true)}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!validateEmail(email)}
              >
                Cadastrar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="self-center font-medium">Adicionar usuário</h1>
          <TextInput
            label="Email"
            className="rounded-md bg-white"
            value={email}
            onChange={setEmail}
            {...emailProps}
          />
        </Modal>
      )}
      {showMutateAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Confirmar cadastro"
          text={`Tem certeza que deseja cadastrar o novo usuário ${email}?`}
          onClickOutside={() => setShowMutateAlert(false)}
        >
          <button
            className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              createProfile.mutate({ email });
              setEmail("");
              setShowModal(false);
            }}
          >
            {createProfile.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
          {!createProfile.isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowMutateAlert(false)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      <Header user={session?.user} />
      <div className="m-2 flex items-center gap-2">
        <div className="relative grow">
          <input
            type="text"
            className="block h-12 w-full appearance-none rounded-full pl-4 pr-12 shadow-md outline-none ring-0 focus:outline-none focus:ring-0"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
        </div>
        <button
          className="h-full rounded-md bg-blue-500 px-4 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
          onClick={() => setShowModal(true)}
        >
          Adicionar usuário
        </button>
      </div>
      <div className="grow overflow-y-auto" ref={ref}>
        <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
          {!profiles.data && profiles.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            profiles.data && (
              <div className="flex w-full max-w-[32rem] flex-col gap-1 pb-4">
                {profiles.data.pages.flatMap(({ items }) =>
                  items.map(profile => <UserCard key={profile.id} profile={profile} />),
                )}
              </div>
            )
          )}
        </div>
      </div>
      <AdminNavbar isSuperUser={isSuperUser} />
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

  console.log(session);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
