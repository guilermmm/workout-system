import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type NextPage } from "next";
import { getServerSession } from "next-auth/next";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "../server/auth";
import { api } from "../utils/api";

const Home = () => {
  const { data: sessionData } = useSession();

  const user = api.app.getUser.useQuery(undefined, {
    enabled: sessionData?.user != null,
  });

  const workouts = api.workoutRouter.getWorkouts.useQuery({
    userId: sessionData?.user.id!,
  });

  if (sessionData?.user == null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
        <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
          LOGO
        </div>
        <div>
          <div className="rounded-full bg-blue-600 p-3 font-medium text-white">
            <button onClick={() => signIn("google")}>
              <div className="flex items-center justify-center">
                <Image
                  width={48}
                  height={48}
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
  }

  return (
    <div className="min-h-full bg-gray-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={sessionData.user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg text-blue-700">
            Olá, <span className="font-bold">{sessionData?.user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-gold-200"
          onClick={() => signOut()}
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
        <div className="mx-2 mt-6 mb-4 w-fit">
          <h1 className="text-xl font-medium text-slate-800">
            Fichas de Treino
          </h1>
          <div className="h-1 bg-gold-500"></div>
        </div>
        <div className="even flex flex-col flex-wrap sm:flex-row">
          {workouts.data?.map((workout) => (
            <WorkoutCard
              key={workout.id}
              name={workout.name}
              description={capitalize(
                join(Array.from(new Set(workout.muscleGroups)))
              )}
              recommended={user.data?.nextWorkoutId === workout.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const join = (array: string[], separator = ", ") => {
  return array.length === 0
    ? ""
    : array.length === 1
    ? array[0]!
    : array.slice(0, -1).join(separator) + " e " + array.slice(-1);
};

const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const classList = (...classes: (string | Record<string, boolean>)[]) => {
  return classes
    .map((c) => {
      return typeof c === "string"
        ? c
        : Object.entries(c)
            .filter(([, v]) => v)
            .map(([k]) => k);
    })
    .flat()
    .join(" ");
};

type Props = {
  name: string;
  description: string;
  recommended?: boolean;
};

const WorkoutCard = ({ name, description, recommended = false }: Props) => {
  return (
    <div className="m-2 flex min-w-fit flex-1 flex-col justify-center rounded-md bg-blue-500 p-6 pt-4 pl-3 text-white transition-colors hover:bg-blue-600">
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
        <div className="text-xl font-medium">{name}</div>
        <div className="text-sm font-thin opacity-90">{description}</div>
      </div>
    </div>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="rounded-full bg-gold-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
