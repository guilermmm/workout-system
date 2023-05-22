import { useRouter } from "next/router";
import { useState } from "react";
import { capitalize, classList, getDateArrayFromDate } from "../../utils";
import type { RouterOutputs } from "../../utils/api";
import { methodExplanation, methodTranslation, weekdaysAbbrv } from "../../utils/consts";
import type { FinishedExercise } from "../../utils/types";
import Alert from "../Alert";
import FullPage from "../FullPage";
import { useModal } from "../ModalContext";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";
import CheckIcon from "../icons/CheckIcon";
import InformationIcon from "../icons/InformationIcon";
import XMarkIcon from "../icons/XMarkIcon";

type Workout = RouterOutputs["finishedWorkout"]["getManyByProfileId"][number];

interface Props {
  finishedWorkouts: Workout[] | undefined;
}

interface PageProps extends Props {
  children: React.ReactNode;
}

const WorkoutHistoryPage = ({ finishedWorkouts, children }: PageProps) => {
  const router = useRouter();

  const [, ShowSecondaryModal] = useModal();
  const [showWorkout, setShowWorkout] = useState<Workout>();

  const workoutTime = showWorkout && timeDifference(showWorkout.startedAt, showWorkout.finishedAt);

  return (
    <FullPage>
      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de treinos</span>
        </h1>
      </div>
      <div className="flex h-full w-full items-center justify-center overflow-y-auto p-2">
        <Calendar onClickOnWorkout={setShowWorkout} finishedWorkouts={finishedWorkouts} />
      </div>
      {showWorkout && (
        <ShowSecondaryModal
          className="z-20 bg-black bg-opacity-25 p-4"
          onClickOutside={() => setShowWorkout(undefined)}
        >
          <div className="flex max-h-full w-full max-w-xl flex-col gap-4 rounded-md bg-slate-50 p-4 shadow-md">
            <div className="ml-2 flex justify-between font-medium">
              <h2 className="font-medium">
                Treino <b>{showWorkout.name}</b>
              </h2>
              <div>
                {showWorkout.startedAt.toLocaleString("pt-BR", {
                  dateStyle: "short",
                })}
              </div>
              <div>
                {showWorkout.startedAt.toLocaleString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {showWorkout.finishedAt.toLocaleString("pt-BR", {
                  timeStyle: "short",
                })}
                {" ("}
                {workoutTime!.hours !== 0 && `${workoutTime!.hours}h`}
                {workoutTime!.minutes !== 0 && `${workoutTime!.minutes}min`}
                {workoutTime!.seconds !== 0 && `${workoutTime!.seconds}s`}
                {")"}
              </div>
            </div>
            <div className="flex w-full grow flex-col items-center overflow-y-auto">
              <div className="flex w-full flex-col gap-2">
                {showWorkout.exercises.map((group, i) => {
                  if ("exercises" in group) {
                    const [first, second] = group.exercises;
                    return (
                      <div key={i} className="m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
                        <div className="flex flex-col">
                          <div className="">
                            <span className="p-3 font-medium text-gray-50">Bi-set</span>
                          </div>
                          <div className="flex flex-col items-stretch">
                            <ExerciseCard exercise={first} />
                            <ExerciseCard exercise={second} />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return <ExerciseCard key={i} exercise={group} />;
                })}
              </div>
            </div>
            <div className="flex flex-col items-stretch justify-start gap-2 sm:flex-row-reverse">
              <button
                className="rounded-md bg-gold-400 py-2 px-4 font-medium shadow-md"
                onClick={() => setShowWorkout(undefined)}
              >
                Fechar
              </button>
            </div>
          </div>
        </ShowSecondaryModal>
      )}
      {children}
    </FullPage>
  );
};

const timeDifference = (from: Date, to: Date) => {
  const seconds = Math.floor((to.getTime() - from.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return {
    seconds: seconds % 60,
    minutes: minutes % 60,
    hours,
  };
};

interface CalendarProps extends Props {
  onClickOnWorkout: (workout: Workout) => void;
}

const Calendar = ({ finishedWorkouts, onClickOnWorkout }: CalendarProps) => {
  if (!finishedWorkouts) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
      </div>
    );
  }

  const workoutDates = finishedWorkouts.map(finishedWorkout => {
    return {
      day: finishedWorkout.startedAt.getDate(),
      month: finishedWorkout.startedAt.getMonth(),
      workout: finishedWorkout,
    };
  });

  const today = new Date();

  const dateArray = getDateArrayFromDate(today);
  return (
    <div className="flex h-full w-full grow flex-col items-center justify-center gap-2">
      <div className="mb-4 rounded-lg bg-white px-6 py-4 shadow-md">
        <h2 className="text-lg font-medium">
          {capitalize(today.toLocaleString("pt-BR", { month: "long" }))}
          {" de "}
          {today.getFullYear()}
        </h2>
        <div className="h-1 w-full bg-gold-500" />
      </div>
      <div className="grid w-full max-w-[40rem] grid-cols-7 items-center justify-center rounded-2xl border-1 bg-slate-50 p-0.5 shadow-md">
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
          const workout = workoutDates.find(
            w => w.day === date.day && w.month === date.month,
          )?.workout;

          return (
            <button
              key={`${date.day}-${date.month}`}
              className={classList("h-[10vh] p-0.5", {
                "cursor-pointer": !!workout,
                "cursor-default": !workout,
              })}
              onClick={() => workout && onClickOnWorkout(workout)}
            >
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
                    "bg-blue-100": !!workout,
                  })}
                >
                  {date.day}
                </div>
                <div className="flex h-3/5 items-center justify-center">
                  {workout ? (
                    <div className="font-medium">{workout?.name}</div>
                  ) : (
                    <div className="text-slate-800/50">-</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise }: { exercise: FinishedExercise }) => {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white pt-2 shadow-md">
      {showAlert && (
        <Alert
          icon={
            <InformationIcon className="h-10 w-10 rounded-full bg-blue-200 p-2 text-blue-600" />
          }
          title={methodTranslation[exercise.method]}
          text={methodExplanation[exercise.method]}
          onClickOutside={() => setShowAlert(false)}
        >
          <button
            className="rounded-md bg-gold-400 py-2 px-4 font-medium shadow-md"
            onClick={() => setShowAlert(false)}
          >
            Entendi
          </button>
        </Alert>
      )}
      <div className="absolute left-4 top-4">
        <span className="font-medium text-blue-600">{exercise.exercise.name}</span>
      </div>
      <div className={classList("flex flex-col transition-all duration-200")}>
        <div className="flex flex-col px-4">
          <div className=" flex h-10 flex-row items-center justify-between">
            <div className="flex flex-row flex-wrap items-center">
              <div className="opacity-0">{exercise.exercise.name}</div>
              <div className="ml-4 text-sm text-slate-600">{exercise.exercise.category}</div>
            </div>
            {exercise.method !== "Standard" && (
              <div className="mr-10 text-sm">
                <button className="flex items-center gap-1" onClick={() => setShowAlert(true)}>
                  {methodTranslation[exercise.method]}
                  <InformationIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        {exercise.description && (
          <div className="mx-2 mb-2 rounded-md border-1 p-2 text-sm text-slate-800 shadow-inner">
            {exercise.description}
          </div>
        )}
        <div className="mt-2 flex flex-col text-sm text-slate-800">
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className="mx-2 mb-2 flex items-center justify-between gap-4 rounded-md border-1 p-1.5 pl-3 shadow-md"
            >
              <div className="font-medium">{i + 1}.</div>
              <div className="flex items-center gap-1">
                <span>Peso: </span>
                <span className="font-medium">{set.weight / 1000}kg</span>
              </div>
              {"time" in set ? (
                <div>
                  <span>Tempo: </span>
                  <span className="font-medium">
                    {set.time > 60 && `${Math.floor(set.time / 60)}min`}
                  </span>
                  <span className="font-medium">{set.time % 60 > 0 && ` ${set.time % 60}s`}</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">{set.reps}</span>
                  <span> {set.reps > 1 ? "repetições" : "repetição"}</span>
                </div>
              )}
              <div
                className={classList("h-6 w-6 border-2 transition-all", {
                  "rounded-2xl border-red-400 text-red-400": !set.completed,
                  "rounded-2xl border-green-600 text-green-600": set.completed,
                })}
              >
                <div className="flex h-full w-full items-center justify-center">
                  {set.completed ? (
                    <CheckIcon className="h-full w-full p-1" />
                  ) : (
                    <XMarkIcon className="h-full w-full p-1" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistoryPage;
