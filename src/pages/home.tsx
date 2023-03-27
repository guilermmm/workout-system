import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import Image from "next/image";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import UserNavbar from "../components/UserNavbar";
import Spinner from "../components/Spinner";
import { getServerAuthSession } from "../server/auth";
import { Weekday } from "@prisma/client";
import Link from "next/link";
import { capitalize, classList, join } from "../utils";
import { api } from "../utils/api";
import { weekdaysAbbrv } from "../utils/consts";
import Error from "../components/Error";
import { Fragment } from "react";

const Home = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const workouts = api.workout.getWorkoutsBySession.useQuery();

  if (workouts.error) {
    return <Error />;
  }

  const weekDayWorkouts =
    workouts.data &&
    Object.values(Weekday).map(
      day => [day, workouts.data.find(workout => workout.days.includes(day))] as const,
    );

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => void signOut()}
        >
          <ArrowRightOnRectangleIcon />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        {workouts.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          <div className="mx-4 mt-4 grid grid-cols-[auto_1fr]">
            {weekDayWorkouts!.map(
              ([day, workout]) =>
                workout && (
                  <Fragment key={day}>
                    <div className="mr-2 flex w-16 flex-col items-center justify-center rounded-md p-4 text-2xl font-bold text-slate-400">
                      {weekdaysAbbrv[day]}
                    </div>
                    <WorkoutCard
                      key={workout.id}
                      id={workout.id}
                      name={workout.name}
                      description={capitalize(join(workout.categories))}
                    />
                  </Fragment>
                ),
            )}
          </div>
        )}
      </div>
      <UserNavbar />
    </div>
  );
};

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

export default Home;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
