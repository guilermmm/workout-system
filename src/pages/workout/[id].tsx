import type { Exercise, ExerciseInWorkout } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../components/icons/CheckCircleIcon";
import CheckIcon from "../../components/icons/CheckIcon";
import ClockIcon from "../../components/icons/ClockIcon";
import Spinner from "../../components/Spinner";
import { getServerAuthSession } from "../../server/auth";
import { classList, useLocalStorage } from "../../utils";
import { api } from "../../utils/api";
import type { ParseJsonValues, Sets } from "../../utils/types";

const Workout = () => {
  const router = useRouter();

  const { id } = router.query as { id: string };

  const workout = api.workout.getByIdBySession.useQuery(id);

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <div className="flex max-w-full items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <button
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => router.back()}
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-medium text-blue-700">
            Treino <span className="font-bold">{workout.data?.name}</span>
          </h1>
        </div>
      </div>
      <div className="grow">
        {workout.isLoading ? (
          <div className="flex h-full items-center justify-center overflow-y-scroll">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          (() => {
            if (!workout.data) return null;

            type E = (typeof workout.data.exercises)[number];

            const groups: ([E, E] | E)[] = workout.data.exercises.reduce((acc, exercise) => {
              const isAlreadyInAGroup = acc.find(
                g => Array.isArray(g) && g.find(e => e.id === exercise.id),
              );
              if (isAlreadyInAGroup) {
                return acc;
              }

              const biSet = workout.data.biSets.find(
                ([a, b]) => a === exercise.id || b === exercise.id,
              );
              if (biSet) {
                const [a, b] = biSet;
                if (a === exercise.id) {
                  return [...acc, [exercise, workout.data.exercises.find(e => e.id === b)!]];
                } else {
                  return [...acc, [workout.data.exercises.find(e => e.id === a)!, exercise]];
                }
              }

              return [...acc, exercise];
            }, [] as ([E, E] | E)[]);

            return groups.map(group => {
              if (Array.isArray(group)) {
                const [a, b] = group;
                return <BiSetCard key={a.id} first={a} second={b} />;
              }

              const exercise = group;

              return (
                <ExerciseCard
                  key={exercise.id}
                  description={exercise.description}
                  exercise={exercise.exercise}
                  sets={exercise.sets}
                />
              );
            });
          })()
        )}
      </div>
      <div className="bg-white p-4 shadow-md">
        <Footer id={id} />
      </div>
    </div>
  );
};

type ExerciseCardProps = {
  description: string | null;
  exercise: ParseJsonValues<Exercise>;
  sets: Sets;
};

const ExerciseCard = ({ description, exercise, sets }: ExerciseCardProps) => {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="m-2 flex justify-between rounded-lg bg-white p-4 shadow-md">
      <div>
        <div className="text-md font-medium text-blue-600">{exercise.name}</div>
        <div className="text-sm text-slate-600">{exercise.category}</div>
        <div className="text-sm">{description}</div>
        {/* q porra é essa aq --->> */}{" "}
      </div>
      <div className="flex items-center justify-between">
        <div className="mr-5 text-right text-sm">
          <div className="font-medium text-slate-700">
            <div className="font-medium text-slate-700">{sets.length} séries</div>
            {/* {exercise.exercise.hasReps ? (
              <div className="font-medium text-slate-700">{exercise.reps} repetições</div>
            ) : (
              <div className="font-medium text-slate-700">{exercise.time} segundos</div>
            )} */}
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
            {completed && <CheckIcon className="h-6 w-6" />}
          </div>
        </button>
      </div>
    </div>
  );
};

type BiSetCardProps = {
  first: ParseJsonValues<ExerciseInWorkout & { exercise: Exercise }>;
  second: ParseJsonValues<ExerciseInWorkout & { exercise: Exercise }>;
};

const BiSetCard: React.FC<BiSetCardProps> = ({ first, second }: BiSetCardProps) => {
  return (
    <div className="m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="flex flex-row items-center justify-between px-2">
        <span className="ml-4 font-medium text-gray-50">Bi-set</span>
      </div>
      <div className="m-2 mt-1 flex flex-col items-stretch">
        <ExerciseCard description={first.description} exercise={first.exercise} sets={first.sets} />
        <ExerciseCard
          description={second.description}
          exercise={second.exercise}
          sets={second.sets}
        />
      </div>
    </div>
  );
};

const Footer = ({ id }: { id: string }) => {
  type State = "not-started" | "started" | "finished";

  const [state, setState] = useState<State>("not-started");

  const [storage, setStorage] = useLocalStorage<
    Record<string, { startedAt: string; finishedAt: string }>
  >("workout-times", {});

  // const finishWorkout = api.workout.recommendNext.useMutation();

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
              // finishWorkout.mutate({ lastWorkoutId: id, profileId });
            }}
          >
            Iniciar treino
            <ClockIcon className="h-8 w-8" />
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
            <CheckCircleIcon className="h-6 w-6" />
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
