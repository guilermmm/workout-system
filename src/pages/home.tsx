import { Weekday } from "@prisma/client";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import Error from "../components/Error";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import ProfilePic from "../components/ProfilePic";
import Spinner from "../components/Spinner";
import UserNavbar from "../components/UserNavbar";
import { getServerAuthSession } from "../server/auth";
import { capitalize, classList, join } from "../utils";
import { api } from "../utils/api";
import { jsDateToWeekday, weekdaysAbbrv } from "../utils/consts";

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

  const today = jsDateToWeekday(new Date());

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <ProfilePic size="md" user={user} />
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
          <div className="mx-4 my-4 grid grid-cols-[auto_1fr]">
            {weekDayWorkouts!.map(
              ([day, workout]) =>
                workout && (
                  <Fragment key={day}>
                    <div
                      className={classList(
                        "flex flex-col items-center justify-center p-4 text-2xl font-bold",
                        {
                          "text-slate-400": today !== day,
                          "rounded-l-lg bg-gold-300 text-slate-500": today === day,
                        },
                      )}
                    >
                      {weekdaysAbbrv[day]}
                    </div>
                    <div
                      className={classList("pl-2", {
                        "rounded-r-lg bg-gold-300": today === day,
                      })}
                    >
                      <WorkoutCard
                        id={workout.id}
                        name={workout.name}
                        description={capitalize(join(workout.categories))}
                      />
                    </div>
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
};

const WorkoutCard = ({ id, name, description }: WorkoutCardProps) => {
  return (
    <Link
      href={`/workout/${id}`}
      className="m-2 flex min-w-fit flex-1 flex-col justify-center rounded-md bg-blue-500 py-6 px-9 text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div className="text-xl">
        Treino <span className="font-medium">{name}</span>
      </div>
      <div className="text-sm font-thin opacity-90">{description}</div>
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
