import { Weekday } from "@prisma/client";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import ErrorPage from "../components/ErrorPage";
import FullPage from "../components/FullPage";
import ProfilePic from "../components/ProfilePic";
import Spinner from "../components/Spinner";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import UserNavbar from "../components/user/Navbar";
import { getServerAuthSession } from "../server/auth";
import { capitalize, classList, join } from "../utils";
import { api } from "../utils/api";
import { jsDateToWeekday, weekdaysAbbrv } from "../utils/consts";

const Home = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const workouts = api.workout.getManyBySession.useQuery();

  const profile = api.user.getProfileBySession.useQuery();

  if (workouts.error) {
    return <ErrorPage />;
  }

  if (profile.data?.isActive === false) {
    // TODO: Handle not-active user properly
    return <ErrorPage />;
  }

  const weekDayWorkouts = (arr: NonNullable<typeof workouts.data>) =>
    Object.values(Weekday).map(
      day =>
        [
          day,
          arr
            .filter(workout => workout.days.includes(day))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ] as const,
    );

  const today = jsDateToWeekday(new Date());

  return (
    <FullPage>
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <ProfilePic size="lg" user={user} />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{user.name}</span>!
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
        {workouts.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          <div className="mx-4 my-4 grid grid-cols-[auto_1fr]">
            {weekDayWorkouts(workouts.data).map(
              ([day, workouts]) =>
                workouts.length !== 0 && (
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
                      {workouts.map(workout => (
                        <WorkoutCard
                          key={workout.id}
                          id={workout.id}
                          name={workout.name}
                          description={capitalize(join(workout.categories))}
                        />
                      ))}
                    </div>
                  </Fragment>
                ),
            )}
          </div>
        )}
      </div>
      <UserNavbar />
    </FullPage>
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
