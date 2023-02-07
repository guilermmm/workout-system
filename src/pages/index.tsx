import type { User } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { capitalize, classList, join, useLocalStorage } from "../utils";
import { api } from "../utils/api";

const Home = () => {
  const { data: sessionData } = useSession();

  const user = api.app.getUser.useQuery(undefined, {
    enabled: sessionData?.user != null,
  });

  const id = user.data?.id ?? "";

  const workouts = api.workout.getWorkouts.useQuery(
    { userId: sessionData?.user.id ?? "" },
    { enabled: sessionData?.user != null },
  );

  const [selectedTab, setSelectedTab] = useLocalStorage<Record<string, "manage" | "workouts">>(
    "workout-tab",
    { [id]: user.data?.isInstructor ? "manage" : "workouts" },
  );

  return sessionData?.user == null ? (
    <SignIn />
  ) : user.isLoading || workouts.isLoading ? (
    <Loading />
  ) : user.isError || workouts.isError ? (
    <Error />
  ) : (
    <div className="min-h-full bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={sessionData.user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{sessionData.user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => void signOut()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="mx-4">
        <div className="flex">
          {user.data?.isInstructor && (
            <button
              onClick={() => setSelectedTab({ [id]: "manage" })}
              className="mx-2 mt-6 mb-4 w-fit"
            >
              <h1 className="text-xl font-medium text-slate-800">Gerenciar treinos</h1>
              <div
                className={classList("h-1", {
                  "bg-gold-500": selectedTab[id] === "manage",
                  "bg-slate-300": selectedTab[id] !== "manage",
                })}
              />
            </button>
          )}
          <button
            onClick={() => setSelectedTab({ [id]: "workouts" })}
            className="mx-2 mt-6 mb-4 w-fit"
          >
            <h1 className="text-xl font-medium text-slate-800">Suas fichas de treino</h1>
            <div
              className={classList("h-1", {
                "bg-gold-500": selectedTab[id] === "workouts",
                "bg-slate-300": selectedTab[id] !== "workouts",
              })}
            />
          </button>
        </div>
        <div className="flex flex-col flex-wrap items-stretch sm:flex-row">
          {selectedTab[id] === "workouts" ? (
            workouts.data.map(workout => (
              <WorkoutCard
                key={workout.id}
                id={workout.id}
                name={workout.name}
                description={capitalize(join(Array.from(new Set(workout.muscleGroups))))}
                recommended={user.data!.nextWorkoutId === workout.id}
              />
            ))
          ) : (
            <ManagementTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

type WorkoutCardProps = {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
};

const WorkoutCard = ({ id, name, description, recommended = false }: WorkoutCardProps) => {
  return (
    <Link
      href={`/workout/${id}`}
      className="m-2 flex min-w-fit flex-1 flex-col justify-center rounded-md bg-blue-500 p-6 pt-4 pl-3 text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div>
        {recommended && (
          <div className="flex text-sm font-medium text-gold-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-1 inline h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                clipRule="evenodd"
              />
            </svg>
            <span>Recomendado</span>
          </div>
        )}
        <div className={classList("pl-6", { "pt-2": !recommended })}>
          <div className="text-xl">
            Treino <span className="font-medium">{name}</span>
          </div>
          <div className="text-sm font-thin opacity-90">{description}</div>
        </div>
      </div>
    </Link>
  );
};

const ManagementTab = () => {
  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 500);

  const users = api.app.searchUsers.useQuery(debouncedInput);

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
        {users.data && users.data.map(user => <UserCard key={user.id} user={user} />)}
      </div>
    </div>
  );
};

const UserCard = ({ user }: { user: User }) => {
  return (
    <Link
      href={`/manage/${user.id}`}
      className="flex flex-1 flex-row items-center rounded-md bg-slate-50 p-3 shadow-md transition-shadow hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Image
          width={48}
          height={48}
          alt={`Foto de perfil de ${user.name!}`}
          src={user.image ?? ""}
          className="h-12 w-12 rounded-full"
        />
      </div>
      <div className="ml-4">
        <div className="truncate text-lg font-medium text-slate-800">{user.name}</div>
        <div className="truncate text-sm text-slate-500">{user.email}</div>
      </div>
    </Link>
  );
};

const SignIn = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
      </div>
      <div>
        <div className="font-medium text-white">
          <button
            onClick={() => void signIn("google")}
            className="block rounded-full bg-blue-600 p-3 transition-colors hover:bg-blue-500"
          >
            <div className="flex items-center justify-center">
              <Image
                width={40}
                height={40}
                alt="Google"
                src="/google.svg"
                className="leading-0 rounded-full bg-white"
              />
              <span className="mx-3">Entrar com Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
      </div>
      <div className="flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          fill="currentColor"
          className="h-64 w-64 text-blue-500"
        >
          <path
            fillRule="evenodd"
            d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="1s"
              from="0 50 50"
              to="360 50 50"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

const Error = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex items-center justify-center">
        <div className="text-2xl font-medium text-white">Ocorreu um erro</div>
        <button
          className="border-2 border-white px-6 py-3 text-2xl font-medium text-slate-900"
          onClick={router.reload}
        >
          Recarregar
        </button>
      </div>
    </div>
  );
};
