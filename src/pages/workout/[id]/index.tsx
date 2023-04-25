import type { Exercise, ExerciseInWorkout, Method } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { z } from "zod";
import Spinner from "../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import CheckIcon from "../../../components/icons/CheckIcon";
import ClockIcon from "../../../components/icons/ClockIcon";
import { getServerAuthSession } from "../../../server/auth";
import { classList, useLocalStorage } from "../../../utils";
import { api } from "../../../utils/api";
import type { ParseJsonValues, Sets } from "../../../utils/types";
import { methodExplanation, methodTranslation } from "../../../utils/consts";
import InformationIcon from "../../../components/icons/InformationIcon";
import Alert from "../../../components/Alert";

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
                  method={exercise.method}
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
  method?: Method;
};

const ExerciseCard = ({ description, exercise, sets, method }: ExerciseCardProps) => {
  const [completedSets, setCompletedSets] = useState<boolean[]>(sets.map(() => false));
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="m-2 flex justify-between rounded-lg bg-white p-4 shadow-md">
      <div>
        <div className="text-lg font-medium text-blue-600">{exercise.name}</div>
        <div className="text-sm text-slate-600">{exercise.category}</div>
        {description && <div className="text-sm font-medium text-blue-600">Obs:</div>}
        <div className="text-sm">{description}</div>
        <div className="text-sm font-medium text-blue-600">Método:</div>
        {method && (
          <div className="text-sm">
            <button className="flex gap-[0.1rem]" onClick={() => setShowAlert(true)}>
              {methodTranslation[method as keyof typeof methodTranslation]}
              <InformationIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {showAlert && (
          <Alert
            icon={
              <InformationIcon className="h-10 w-10 rounded-full bg-yellow-200 p-2 text-blue-500" />
            }
            title={methodTranslation[method as keyof typeof methodTranslation]}
            text={methodExplanation[method as keyof typeof methodExplanation]}
          >
            <button
              className="rounded-md border-1 bg-gold-500 py-2 px-4 text-black shadow-md"
              onClick={() => {
                setShowAlert(false);
              }}
            >
              Ok!
            </button>
          </Alert>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-right text-sm">
          <div className="font-medium text-slate-700">
            <div className="font-medium text-slate-700">
              {sets.map((set, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div>Série {i + 1}:</div>
                  {"time" in set ? (
                    <div className="ml-2 flex items-center">
                      <ClockIcon className="mr-[0.1rem] inline-block h-4 w-4" />{" "}
                      {set.time < 60
                        ? `${set.time} segundos`
                        : set.time === 60
                        ? "1 minuto"
                        : `${set.time / 60} minutos ${set.time % 60} segundos`}
                    </div>
                  ) : (
                    <span className="ml-2 flex items-center">
                      <CheckCircleIcon className="mr-[0.1rem] inline-block h-4 w-4" /> {set.reps}{" "}
                      {set.reps === 1 ? "repetição" : "repetições"}
                    </span>
                  )}
                  <button
                    className={classList(
                      "ml-1 h-7 w-7 rounded-md border-3 text-green-600 transition hover:bg-white",
                      {
                        "border-slate-400": !completedSets[i],
                        "border-green-600": !!completedSets[i],
                      },
                    )}
                    onClick={() =>
                      setCompletedSets(compSets =>
                        compSets.map((compSet, j) => (i === j ? !compSet : compSet)),
                      )
                    }
                  >
                    <div className="flex h-5 w-5 items-center justify-center">
                      {completedSets[i] && <CheckIcon className="h-6 w-6" />}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
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

const storageParser = z.record(
  z.object({
    startedAt: z.string(),
    finishedAt: z.string(),
  }),
);

const Footer = ({ id }: { id: string }) => {
  type State = "not-started" | "started" | "finished";

  const [state, setState] = useState<State>("not-started");

  const [storage, setStorage] = useLocalStorage("workout-times", storageParser, {});

  const [showAlert, setShowAlert] = useState(false);

  const finishWorkout = api.user.finishWorkout.useMutation({
    onSuccess: () => {
      setState("finished");
      pause();
      setStorage({
        [id]: {
          startedAt: storage[id]!.startedAt,
          finishedAt: new Date().toISOString(),
        },
      });
      setShowAlert(false);
    },
  });

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
              setShowAlert(true);
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

      {showAlert && (
        <Alert
          icon={
            <InformationIcon className="h-10 w-10 rounded-full bg-yellow-200 p-2 text-blue-500" />
          }
          title="Finalizar"
          text="Tem certeza que deseja finalizar o treino?"
        >
          <button
            className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md"
            onClick={() => {
              finishWorkout.mutate({ date: new Date(), workoutId: id });
            }}
          >
            Sim
          </button>
          <button
            className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md"
            onClick={() => {
              setShowAlert(false);
            }}
          >
            Não
          </button>
        </Alert>
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
