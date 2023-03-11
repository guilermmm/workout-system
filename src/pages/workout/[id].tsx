import type { Exercise, ExerciseInWorkout } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import Loading from "../../components/Loading";
import { classList, useLocalStorage } from "../../utils";
import { api } from "../../utils/api";

const Workout = () => {
  const router = useRouter();

  const { id } = router.query as { id: string };

  const workout = api.workout.getWorkout.useQuery({ id });

  const { data: sessionData } = useSession();

  return workout.data == null ? (
    <Loading />
  ) : (
    <div className="min-h-full bg-slate-100">
      <div className="flex max-w-full items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <button
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => router.back()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-medium text-blue-700">
            Treino <span className="font-bold">{workout.data.name}</span>
          </h1>
        </div>
      </div>
      <div>
        {workout.data.exercises.map(exercise => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
        {sessionData?.user && <Footer id={id} userId={sessionData.user.id} />}
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise }: { exercise: ExerciseInWorkout & { exercise: Exercise } }) => {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="m-2 flex justify-between rounded-lg bg-white p-4 shadow-md" key={exercise.id}>
      <div>
        <div className="text-md font-medium text-blue-600">{exercise.exercise.name}</div>
        <div className="text-sm text-slate-600">{exercise.exercise.category}</div>
        <div className="text-sm">{exercise.description}</div>{" "}
      </div>
      <div className="flex items-center justify-between">
        <div className="mr-5 text-right text-sm">
          <div className="font-medium text-slate-700">
            <div className="font-medium text-slate-700">{exercise.sets} séries</div>
            {exercise.exercise.hasReps ? (
              <div className="font-medium text-slate-700">{exercise.reps} repetições</div>
            ) : (
              <div className="font-medium text-slate-700">{exercise.time} segundos</div>
            )}
          </div>
        </div>
        <button
          className={classList("rounded-xl border-3 text-green-600 transition hover:bg-white", {
            "border-slate-400": !completed,
            "border-green-600": completed,
          })}
          onClick={() => setCompleted(!completed)}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            {completed && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

const Footer = ({ userId, id }: { userId: string; id: string }) => {
  type State = "not-started" | "started" | "finished";

  const [state, setState] = useState<State>("not-started");

  const [storage, setStorage] = useLocalStorage<
    Record<string, { startedAt: string; finishedAt: string }>
  >("workout-times", {});

  const finishWorkout = api.workout.recommendNext.useMutation();

  const { seconds, minutes, hours, reset, pause } = useStopwatch({ autoStart: false });

  useEffect(() => {
    const timeStarted = storage[id]?.startedAt;
    const timeFinished = storage[id]?.finishedAt;

    if (timeStarted && !timeFinished) {
      setState("started");
      const now = new Date();
      const elapsed = new Date();
      elapsed.setSeconds(
        elapsed.getSeconds() + (now.getTime() - new Date(timeStarted).getTime()) / 1000,
      );
      reset(elapsed, true);
    } else if (timeStarted && timeFinished) {
      setState("not-started");
      const elapsed = new Date();
      elapsed.setSeconds(
        elapsed.getSeconds() +
          (new Date(timeFinished).getTime() - new Date(timeStarted).getTime()) / 1000,
      );
      reset(elapsed, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-between">
      {state === "not-started" ? (
        <>
          <div className="font-medium text-slate-900/50">
            {fix(hours)}h {fix(minutes)}min {fix(seconds)}s
          </div>
          <button
            className="flex items-center gap-3 rounded-full border-2 border-blue-600 bg-white px-6 py-2 font-medium text-blue-600"
            onClick={() => {
              setState("started");
              reset(undefined, true);
              setStorage({
                [id]: {
                  startedAt: new Date().toISOString(),
                  finishedAt: "",
                },
              });
              finishWorkout.mutate({ lastWorkoutId: id, userId: userId });
            }}
          >
            Iniciar treino
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </>
      ) : state === "started" ? (
        <>
          <div className="font-medium text-blue-600">
            {fix(hours)}h {fix(minutes)}min {fix(seconds)}s
          </div>
          <button
            className="flex items-center gap-3 rounded-full border-2 border-gold-200 bg-gold-500 px-6 py-2 font-medium text-slate-900"
            onClick={() => {
              setState("finished");
              pause();
              setStorage({
                [id]: {
                  startedAt: storage[id]!.startedAt,
                  finishedAt: new Date().toISOString(),
                },
              });
            }}
          >
            Concluir treino
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.25}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </>
      ) : (
        <>
          <div className="font-medium text-green-600">
            {fix(hours)}h {fix(minutes)}min {fix(seconds)}s
          </div>
          <div className="flex items-center border-2 border-transparent px-6 py-2 font-medium text-green-600">
            <div className="h-8">Treino finalizado</div>
          </div>
        </>
      )}
    </div>
  );
};

const fix = (num: number) => num.toString().padStart(2, "0");

export default Workout;
