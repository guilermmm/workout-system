import type { FinishedWorkout, Workout } from "@prisma/client";
import { useRouter } from "next/router";
import { classList, getDateArrayFromDate } from "../../utils";
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
      <div className="flex h-full w-full items-center justify-center overflow-y-auto p-2">
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

  const workoutDates = finishedWorkouts.map(finishedWorkout => {
    const date = new Date(finishedWorkout.date);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      workout: workouts.find(workout => workout.id === finishedWorkout.workoutId),
    };
  });

  const today = new Date();

  const dateArray = getDateArrayFromDate(today);
  return (
    <div className="grid min-w-[50%] max-w-[40rem] grow grid-cols-7 items-center justify-center rounded-2xl border-1 bg-slate-50 p-0.5 shadow-md">
      {Object.values(weekdaysAbbrv).map(weekday => (
        <div
          key={weekday}
          className={classList(
            "mb-2 flex h-[10vh] grow items-center justify-center bg-blue-600 font-medium text-white ring-2 ring-blue-600",
            {
              "rounded-tl-lg": weekday === "DOM",
              "rounded-tr-lg": weekday === "SAB",
            },
          )}
        >
          {weekday}
        </div>
      ))}
      {dateArray.map(date => {
        const isToday = date.day === today.getDate() && date.month === today.getMonth();
        const isFinished = workoutDates.find(w => w.day === date.day && w.month === date.month);

        return (
          <div key={`${date.day}-${date.month}`} className="h-[10vh] p-0.5">
            <div
              className={classList("flex h-full flex-col rounded-md border-1 text-center", {
                "border-slate-200 bg-slate-50 shadow-sm": date.month === today.getMonth(),
                "border-slate-100 bg-slate-200": date.month !== today.getMonth(),
                "ring-4 ring-gold-100": isToday,
              })}
            >
              <div
                className={classList("flex h-2/5 items-center justify-center font-medium", {
                  "bg-blue-100 text-blue-600": date.month === today.getMonth(),
                  "text-slate-800/50": date.month !== today.getMonth(),
                  "bg-blue-100": !!isFinished,
                })}
              >
                {date.day}
              </div>
              <div className="flex h-3/5 items-center justify-center">
                {isFinished ? (
                  <div className="font-medium">{isFinished.workout?.name}</div>
                ) : (
                  <div className="text-slate-800/50">-</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutHistoryPage;
