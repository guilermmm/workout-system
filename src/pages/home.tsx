import { Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { Fragment, useMemo } from "react";
import FullPage from "../components/FullPage";
import ProfilePic from "../components/ProfilePic";
import QueryErrorAlert from "../components/QueryErrorAlert";
import Spinner from "../components/Spinner";
import { getServerAuthSession } from "../server/auth";
import { capitalize, classList, join } from "../utils";
import { api } from "../utils/api";
import { jsDateToWeekday, weekdaysAbbrv } from "../utils/consts";

const Home = () => {
  const workouts = api.workout.getManyBySession.useQuery();

  const profile = api.user.getProfileBySession.useQuery();

  const weekDayWorkouts = useMemo(
    () =>
      workouts.data &&
      Object.values(Weekday).map(
        day =>
          [
            day,
            workouts.data
              .filter(w => w.days.includes(day))
              .sort((a, b) => a.name.localeCompare(b.name)),
          ] as const,
      ),
    [workouts.data],
  );

  const today = jsDateToWeekday(new Date());

  return (
    <FullPage>
      <QueryErrorAlert queries={[profile, workouts]} />
      <div className="flex items-center justify-between bg-gold-500 p-2">
        {profile.data && (
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{profile.data.user?.name}</span>!
          </h1>
        )}
        {profile.isLoading ? (
          <Spinner className="h-16 w-16 fill-blue-600 text-gray-200" />
        ) : (
          profile.data && (
            <Link href="/profile">
              <ProfilePic size="lg" user={profile.data.user} />
            </Link>
          )
        )}
      </div>
      <div className="grow overflow-y-auto">
        <div className="flex h-full grow flex-col items-center">
          {workouts.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <div className="grid w-full max-w-[32rem] grid-cols-[auto_1fr] gap-y-1 px-2 py-4">
              {weekDayWorkouts?.map(
                ([day, workouts]) =>
                  workouts.length !== 0 && (
                    <Fragment key={day}>
                      <div
                        className={classList(
                          "flex flex-col items-center justify-center rounded-l-lg p-4 pl-6 text-2xl font-bold",
                          {
                            "bg-slate-200 text-slate-400": today !== day,
                            "bg-gold-200 text-slate-500": today === day,
                          },
                        )}
                      >
                        {weekdaysAbbrv[day]}
                      </div>
                      <div
                        className={classList("rounded-r-lg", {
                          "bg-slate-200": today !== day,
                          "bg-gold-200": today === day,
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
      </div>
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
      <div className="text-sm font-light opacity-90">{description}</div>
    </Link>
  );
};

export default Home;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
