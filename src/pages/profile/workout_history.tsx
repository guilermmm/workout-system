import { useRouter } from "next/router";
import FullPage from "../../components/FullPage";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import { signOut } from "next-auth/react";
import UserNavbar from "../../components/UserNavbar";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import { weekdaysAbbrv } from "../../utils/consts";
import type { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../../server/auth";
import { getDateArrayFromDate } from "../../utils";
import { api } from "../../utils/api";
const WorkoutHistory = () => {
  const router = useRouter();

  return (
    <FullPage>
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de treinos</span>
        </h1>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => {
            void signOut();
          }}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        <Calendar />
      </div>

      <UserNavbar />
    </FullPage>
  );
};

const Calendar = () => {
  const workouts = api.workout.getManyBySession.useQuery();
  const finishedWorkouts = api.user.getFinishedWorkoutsBySession.useQuery();
  const handledFinishedWorkouts = finishedWorkouts.data?.map(finishedWorkout => {
    const date = new Date(finishedWorkout.date);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      workout: workouts.data?.find(workout => workout.id === finishedWorkout.workoutId),
    };
  });

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const dateArray = getDateArrayFromDate(oneMonthAgo);
  const blankDays = Array.from({ length: new Date(oneMonthAgo).getDay() - 1 }, (_, index) => index);
  return (
    <div className="grid grid-cols-7 items-center justify-center p-4">
      {Object.values(weekdaysAbbrv).map(weekday => (
        <div key={weekday} className="mx-2 inline-block h-10 w-10 text-center">
          {weekday}
        </div>
      ))}
      {blankDays.map((_, index) => (
        <div key={index} />
      ))}
      {dateArray.map(date => (
        <div
          key={`${date.day}-${date.month}`}
          className="mx-2 my-4 flex h-10 w-10 flex-col text-center"
        >
          <div>{date.day}</div>
          <div>
            {
              handledFinishedWorkouts?.find(
                finishedWorkout =>
                  finishedWorkout.day === date.day && finishedWorkout.month === date.month,
              )?.workout?.name
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkoutHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
