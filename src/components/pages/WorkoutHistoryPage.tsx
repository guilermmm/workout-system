import type { FinishedWorkout, Workout } from "@prisma/client";
import { useRouter } from "next/router";
import { getDateArrayFromDate } from "../../utils";
import { weekdaysAbbrv } from "../../utils/consts";
import FullPage from "../FullPage";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";

interface Props {
  workouts: Workout[] | undefined;
  finishedWorkouts: FinishedWorkout[] | undefined;
}

interface PageProps extends Props {
  children: React.ReactNode;
}

const WorkoutHistoryPage = ({ workouts, finishedWorkouts, children }: PageProps) => {
  const router = useRouter();

  return (
    <FullPage>
      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de treinos</span>
        </h1>
      </div>
      <div className="grow overflow-y-scroll">
        <Calendar workouts={workouts} finishedWorkouts={finishedWorkouts} />
      </div>

      {children}
    </FullPage>
  );
};

const Calendar = ({ workouts, finishedWorkouts }: Props) => {
  if (!workouts || !finishedWorkouts) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
      </div>
    );
  }

  const handledFinishedWorkouts = finishedWorkouts.map(finishedWorkout => {
    const date = new Date(finishedWorkout.date);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      workout: workouts.find(workout => workout.id === finishedWorkout.workoutId),
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

export default WorkoutHistoryPage;
