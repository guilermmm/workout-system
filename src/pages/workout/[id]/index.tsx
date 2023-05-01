import { Method, Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { z } from "zod";
import Alert from "../../../components/Alert";
import FullPage from "../../../components/FullPage";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import Spinner from "../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import CheckIcon from "../../../components/icons/CheckIcon";
import ChevronDownIcon from "../../../components/icons/ChevronDownIcon";
import ChevronUpIcon from "../../../components/icons/ChevronUpIcon";
import ClockIcon from "../../../components/icons/ClockIcon";
import ExclamationTriangleIcon from "../../../components/icons/ExclamationTriangleIcon";
import InformationIcon from "../../../components/icons/InformationIcon";
import { getServerAuthSession } from "../../../server/auth";
import { classList, useClickOutside, useLocalStorage } from "../../../utils";
import { api } from "../../../utils/api";
import { methodExplanation, methodTranslation, weekdaysTranslation } from "../../../utils/consts";

const exerciseParser = z.object({
  id: z.string(),
  exercise: z.object({
    name: z.string(),
    category: z.string(),
  }),
  description: z.string().nullable(),
  method: z.nativeEnum(Method),
  sets: z.array(
    z.union([
      z.object({
        reps: z.number(),
        weight: z.number(),
        completed: z.boolean(),
      }),
      z.object({
        time: z.number(),
        weight: z.number(),
        completed: z.boolean(),
      }),
    ]),
  ),
  collapsed: z.boolean(),
});

const workoutParser = z.object({
  name: z.string(),
  days: z.array(z.nativeEnum(Weekday)),
  exercises: z.array(exerciseParser),
  biSets: z.array(z.tuple([z.string(), z.string()])),
});

const storageParser = z.record(workoutParser);

type Exercise = z.infer<typeof exerciseParser>;
type ExerciseGroup = { id: string; exercises: readonly [Exercise, Exercise] };

const Workout = () => {
  const router = useRouter();

  const { id } = router.query as { id: string };

  const [workoutStorage, setWorkoutStorage, resetWorkoutStorage, verifiedStorage] = useLocalStorage(
    "workout-training",
    storageParser,
    {},
  );

  const workout = useMemo(() => workoutStorage[id], [id, workoutStorage]);

  const workoutQuery = api.workout.getByIdBySession.useQuery(id, {
    enabled: verifiedStorage && !workout,
    onSuccess: data => {
      setWorkout({
        name: data.name,
        days: data.days,
        exercises: data.exercises.map(exercise => ({
          id: exercise.id,
          exercise: {
            name: exercise.exercise.name,
            category: exercise.exercise.category,
          },
          description: exercise.description,
          method: exercise.method,
          sets: exercise.sets.map(set =>
            "reps" in set
              ? { reps: set.reps, weight: set.weight, completed: false }
              : { time: set.time, weight: set.weight, completed: false },
          ),
          collapsed: false,
        })),
        biSets: data.biSets,
      });
    },
  });

  const setWorkout = useCallback(
    (newWorkout: Partial<NonNullable<typeof workout>>) => {
      const updatedWorkout = { ...workout!, ...newWorkout };

      const index = newWorkout.exercises?.findIndex(
        (exercise, index) =>
          exercise.sets.every(set => set.completed) &&
          workout?.exercises[index]!.sets.some(set => !set.completed),
      );

      if (index !== undefined && index !== -1) {
        updatedWorkout.exercises[index]!.collapsed = true;

        const nextIndex = updatedWorkout.exercises.findIndex(
          (e, i) => i > index && e.sets.some(set => !set.completed),
        );
        if (nextIndex !== -1) {
          console.log(nextIndex);
          console.log(updatedWorkout.exercises[nextIndex]);

          updatedWorkout.exercises[nextIndex]!.collapsed = false;
        }
      }

      setWorkoutStorage({ [id]: updatedWorkout });
    },
    [id, workout, setWorkoutStorage],
  );

  const groups = useMemo(
    () =>
      workout?.exercises.reduce((acc, exercise) => {
        const isAlreadyInAGroup = acc.find(
          g => "exercises" in g && g.exercises.find(e => e.id === exercise.id),
        );
        if (isAlreadyInAGroup) {
          return acc;
        }

        if (workout.biSets.some(([, b]) => b === exercise.id)) {
          return acc;
        }

        const biSet = workout.biSets.find(([a]) => a === exercise.id);
        if (biSet) {
          const [, b] = biSet;
          const group = [exercise, workout.exercises.find(e => e.id === b)!] as const;

          return [...acc, { id: exercise.id, exercises: group }];
        }

        return [...acc, exercise];
      }, [] as (ExerciseGroup | Exercise)[]),
    [workout],
  );

  return (
    <FullPage>
      <QueryErrorAlert queries={[workoutQuery]} />
      <div className="flex flex-row items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <button
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => router.back()}
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-medium text-blue-700">
            Treino <span className="font-bold">{workout?.name}</span>
          </h1>
        </div>
        <div className="flex h-full p-1 pt-1.5">
          {workout?.days.map(day => (
            <div
              key={day}
              className="m-1 flex items-center justify-center rounded-md bg-blue-600 p-3 text-sm text-white"
            >
              {weekdaysTranslation[day]}
            </div>
          ))}
        </div>
      </div>
      <div className="flex grow flex-col items-center overflow-y-auto">
        <div className="min-h-full w-full max-w-[48rem]">
          {!workout && workoutQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            groups?.map(group => {
              if ("exercises" in group) {
                const [a, b] = group.exercises;

                return (
                  <BiSetCard
                    key={group.id}
                    first={a}
                    setFirst={first => {
                      setWorkout({
                        exercises: workout!.exercises.map(e =>
                          e.id === a.id ? { ...e, ...first } : e,
                        ),
                      });
                    }}
                    second={b}
                    setSecond={second => {
                      setWorkout({
                        exercises: workout!.exercises.map(e =>
                          e.id === b.id ? { ...e, ...second } : e,
                        ),
                      });
                    }}
                    collapsed={a.collapsed && b.collapsed}
                    setCollapsed={collapsed => {
                      setWorkout({
                        exercises: workout!.exercises.map(e =>
                          e.id === a.id || e.id === b.id ? { ...e, collapsed } : e,
                        ),
                      });
                    }}
                  />
                );
              }

              const exercise = group;
              return (
                <ExerciseCard
                  key={exercise.id}
                  description={exercise.description}
                  exercise={exercise.exercise}
                  sets={exercise.sets}
                  method={exercise.method}
                  collapsed={exercise.collapsed}
                  setSelf={self => {
                    setWorkout({
                      exercises: workout!.exercises.map(e =>
                        e.id === exercise.id ? { ...e, ...self } : e,
                      ),
                    });
                  }}
                />
              );
            })
          )}
        </div>
      </div>
      <Footer
        workoutId={id}
        resetStorage={() => resetWorkoutStorage()}
        verifiedStorage={verifiedStorage}
      />
    </FullPage>
  );
};

type ExerciseCardProps = Pick<Exercise, "description" | "exercise" | "sets" | "method"> & {
  collapsed: boolean;
  setSelf: (exercise: Partial<Exercise>) => void;
  uncollapsable?: boolean;
};

const ExerciseCard = ({
  description,
  exercise,
  sets,
  method,
  collapsed,
  setSelf,
  uncollapsable = false,
}: ExerciseCardProps) => {
  const [showAlert, setShowAlert] = useState(false);

  const alertRef = useClickOutside<HTMLDivElement>(() => setShowAlert(false));

  const isCollapsed = collapsed && !uncollapsable;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white pt-2 shadow-md">
      {showAlert && (
        <Alert
          icon={
            <InformationIcon className="h-10 w-10 rounded-full bg-blue-200 p-2 text-blue-600" />
          }
          title={methodTranslation[method]}
          text={methodExplanation[method]}
          ref={alertRef}
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
        <span className="font-medium text-blue-600">{exercise.name}</span>
      </div>
      {!uncollapsable && (
        <button
          className={classList(
            "absolute right-2 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md hover:bg-gray-300 hover:text-white",
          )}
          onClick={() => setSelf({ collapsed: !collapsed })}
        >
          {collapsed ? (
            <ChevronDownIcon className="h-6 w-6" />
          ) : (
            <ChevronUpIcon className="h-6 w-6" />
          )}
        </button>
      )}
      <div
        className={classList("h-12 transition-all duration-200", {
          "max-h-[3rem]": isCollapsed,
          "max-h-0 overflow-y-hidden": !isCollapsed,
        })}
      >
        <div className="h-full w-full" />
      </div>
      <div
        className={classList("flex flex-col transition-all duration-200", {
          "max-h-[100rem]": !isCollapsed,
          "max-h-0 overflow-y-hidden": isCollapsed,
        })}
      >
        <div className="flex flex-col px-4">
          <div className=" flex h-10 flex-row items-center justify-between">
            <div className="flex flex-row flex-wrap items-center">
              <div className="opacity-0">{exercise.name}</div>
              <div className="ml-4 text-sm text-slate-600">{exercise.category}</div>
            </div>
            {method !== "Standard" && (
              <div className="text-sm">
                <button className="flex items-center gap-1" onClick={() => setShowAlert(true)}>
                  {methodTranslation[method as keyof typeof methodTranslation]}
                  <InformationIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        {description && (
          <div className="mx-2 mb-2 rounded-md border-1 p-2 text-sm text-slate-800 shadow-inner">
            {description}
          </div>
        )}
        <div className="mt-2 flex flex-col text-sm font-medium text-slate-800">
          {sets.map((set, i) => (
            <div
              key={i}
              className="mx-2 mb-2 flex items-center justify-between rounded-md border-1 p-1.5 pl-3 shadow-md"
            >
              <div>{i + 1}.</div>
              <div>
                <span className="font-normal">Peso: </span>
                <span>{fixWeight(set.weight)}kg</span>
              </div>
              {"time" in set ? (
                <div>
                  {set.time < 60
                    ? `${set.time} segundos`
                    : set.time === 60
                    ? "1 minuto"
                    : `${set.time / 60} minutos ${set.time % 60} segundos`}
                </div>
              ) : (
                <div>
                  <span>{set.reps}</span>
                  <span className="font-normal"> {set.reps > 1 ? "repetições" : "repetição"}</span>
                </div>
              )}
              <button
                className={classList("h-8 w-8 border-2 text-green-600 transition-all", {
                  "rounded-lg border-slate-400": !set.completed,
                  "rounded-2xl border-green-600": set.completed,
                })}
                onClick={() => {
                  setSelf({
                    sets: sets.map((set, j) =>
                      j === i ? { ...set, completed: !set.completed } : set,
                    ),
                  });
                }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  {set.completed && <CheckIcon className="h-full w-full p-1" />}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type BiSetCardProps = {
  first: Exercise;
  setFirst: (exercise: Exercise) => void;
  second: Exercise;
  setSecond: (exercise: Exercise) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const BiSetCard = ({
  first,
  setFirst,
  second,
  setSecond,
  collapsed,
  setCollapsed,
}: BiSetCardProps) => {
  return (
    <div className="relative m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="absolute left-4 top-4">
        <span className="font-medium text-gray-50">Bi-set</span>
      </div>
      <button
        className={classList(
          "absolute right-2 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md hover:bg-gray-300 hover:text-white",
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      <div
        className={classList("h-12 transition-all duration-200", {
          "max-h-[3rem]": collapsed,
          "max-h-0 overflow-y-hidden": !collapsed,
        })}
      >
        <div className="flex h-full w-full items-center justify-center pl-16 pr-14 pb-2">
          <div className="flex w-full flex-col items-center justify-center gap-1 pl-2 text-sm">
            <ExerciseLabel>{first.exercise.name}</ExerciseLabel>
            <ExerciseLabel>{second.exercise.name}</ExerciseLabel>
          </div>
        </div>
      </div>
      <div
        className={classList("flex flex-col transition-all duration-200", {
          "max-h-[100rem]": !collapsed,
          "max-h-0 overflow-y-hidden": collapsed,
        })}
      >
        <div className="h-10" />
        <div className="flex flex-col items-stretch">
          <ExerciseCard
            description={first.description}
            exercise={first.exercise}
            sets={first.sets}
            method={first.method}
            collapsed={first.collapsed}
            setSelf={self => setFirst({ ...first, ...self })}
            uncollapsable
          />
          <ExerciseCard
            description={second.description}
            exercise={second.exercise}
            sets={second.sets}
            method={second.method}
            collapsed={second.collapsed}
            setSelf={self => setSecond({ ...second, ...self })}
            uncollapsable
          />
        </div>
      </div>
    </div>
  );
};

const ExerciseLabel = ({ children }: { children: string }) => {
  return (
    <div className="flex max-w-full items-center justify-center leading-none">
      <div className="truncate text-white">{children}</div>
    </div>
  );
};

const timerParser = z.object({ startedAt: z.string(), finishedAt: z.string() });

const timerStorageParser = z.record(timerParser);

type FooterProps = {
  workoutId: string;
  resetStorage: () => void;
  verifiedStorage: boolean;
};

const Footer = ({ workoutId, resetStorage, verifiedStorage }: FooterProps) => {
  const [state, setState] = useState<"not-started" | "started" | "finished">("not-started");

  const [timerStorage, setTimerStorage] = useLocalStorage("workout-timer", timerStorageParser, {});

  const timer = timerStorage[workoutId];

  const setTimer = (timer: { startedAt: string; finishedAt: string }) => {
    setTimerStorage({ [workoutId]: timer });
  };

  const [showAlert, setShowAlert] = useState(false);

  const finishWorkout = api.user.finishWorkout.useMutation({
    onSuccess: () => {
      setState("finished");
      pause();
      setTimer({
        startedAt: timer?.startedAt ?? new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      });
      setShowAlert(false);
      resetStorage();
    },
  });

  const { seconds, minutes, hours, reset, pause } = useStopwatch({ autoStart: false });

  useEffect(() => {
    if (verifiedStorage) {
      const timeStarted = timer?.startedAt;
      const timeFinished = timer?.finishedAt;

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedStorage]);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-2 shadow-up">
      {verifiedStorage ? (
        <>
          <div
            className={classList("font-medium", {
              "text-slate-900/50": state === "not-started",
              "text-blue-600": state === "started",
              "text-green-600": state === "finished",
            })}
          >
            {fixTimer(hours)}h {fixTimer(minutes)}min {fixTimer(seconds)}s
          </div>
          {state === "not-started" ? (
            <button
              className="flex items-center gap-3 rounded-full border-2 border-blue-600 bg-white px-6 py-2 font-medium text-blue-600"
              onClick={() => {
                setState("started");
                reset(undefined, true);
                setTimer({ startedAt: new Date().toISOString(), finishedAt: "" });
              }}
            >
              Iniciar treino
              <ClockIcon className="h-6 w-6" />
            </button>
          ) : state === "started" ? (
            <button
              className="flex items-center gap-3 rounded-full border-2 border-gold-500 bg-gold-500 px-6 py-2 font-medium text-slate-900"
              onClick={() => {
                setShowAlert(true);
              }}
            >
              Concluir treino
              <CheckCircleIcon className="h-6 w-6" />
            </button>
          ) : (
            <div className="flex items-center border-2 border-transparent px-6 py-2 font-medium text-green-600">
              Treino finalizado
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-900/500 font-medium">Buscando dados do treino...</div>
      )}

      {showAlert && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-600" />
          }
          title="Finalizar treino"
          text="Tem certeza que deseja finalizar o treino?"
        >
          <button
            className="rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md"
            onClick={() => {
              finishWorkout.mutate({ date: new Date(), workoutId });
            }}
          >
            Confirmar
          </button>
          <button
            className="rounded-md border-1 py-2 px-4 shadow-md"
            onClick={() => {
              setShowAlert(false);
            }}
          >
            Cancelar
          </button>
        </Alert>
      )}
    </div>
  );
};

const fixTimer = (num: number) => num.toString().padStart(2, "0");
const fixWeight = (w: number) => (w % 1000 === 0 ? w / 1000 : (w / 1000).toFixed(2));

export default Workout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
