import { Method, Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { z } from "zod";
import Alert from "../../../components/Alert";
import FullPage from "../../../components/FullPage";
import Modal from "../../../components/Modal";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import SmallTextInput from "../../../components/SmallTextInput";
import Spinner from "../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import CheckIcon from "../../../components/icons/CheckIcon";
import ChevronDownIcon from "../../../components/icons/ChevronDownIcon";
import ChevronUpIcon from "../../../components/icons/ChevronUpIcon";
import ClockIcon from "../../../components/icons/ClockIcon";
import ExclamationTriangleIcon from "../../../components/icons/ExclamationTriangleIcon";
import InformationIcon from "../../../components/icons/InformationIcon";
import PhotoIcon from "../../../components/icons/PhotoIcon";
import { getServerAuthSession } from "../../../server/auth";
import { classList, useLocalStorage } from "../../../utils";
import type { RouterOutputs } from "../../../utils/api";
import { api } from "../../../utils/api";
import { methodExplanation, methodTranslation, motivationalPhrases } from "../../../utils/consts";

const exerciseParser = z.object({
  id: z.string(),
  exercise: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
  }),
  description: z.string().nullable(),
  method: z.nativeEnum(Method),
  sets: z.array(
    z.union([
      z.object({
        reps: z.string(),
        weight: z.string(),
        completed: z.boolean(),
      }),
      z.object({
        time: z.number(),
        weight: z.string(),
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

const timerParser = z.object({ startedAt: z.string(), finishedAt: z.string() });

type Timer = z.infer<typeof timerParser>;

const timerStorageParser = z.record(timerParser);

type Exercise = z.infer<typeof exerciseParser>;
type ExerciseGroup = { id: string; exercises: readonly [Exercise, Exercise] };

const storageFromQuery = (workout: RouterOutputs["workout"]["getByIdBySession"]) => ({
  name: workout.name,
  days: workout.days,
  exercises: workout.exercises.map(exercise => ({
    id: exercise.id,
    exercise: {
      id: exercise.exercise.id,
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
  biSets: workout.biSets,
});

const Workout = () => {
  const router = useRouter();

  const { id } = router.query as { id: string };

  const [timerStorage, setTimerStorage] = useLocalStorage("workout-timer", timerStorageParser, {});

  const timerOn = Boolean(timerStorage[id] && !timerStorage[id]!.finishedAt);

  const [workoutStorage, setWorkoutStorage, resetWorkoutStorage, verifiedStorage] = useLocalStorage(
    "workout-training",
    storageParser,
    {},
  );

  const [showImageModal, setShowImageModal] = useState<Exercise["exercise"] | null>(null);

  const selectedExerciseImage = api.exercise.getExerciseImageById.useQuery(
    { id: showImageModal?.id ?? "" },
    { enabled: !!showImageModal },
  );

  const workoutQuery = api.workout.getByIdBySession.useQuery(id, { enabled: false });

  useEffect(() => {
    if (verifiedStorage && !workoutQuery.data) {
      void workoutQuery.refetch();
    }
  }, [verifiedStorage, workoutQuery]);

  const workout = useMemo(
    () =>
      workoutStorage[id] ?? (workoutQuery.data ? storageFromQuery(workoutQuery.data) : undefined),
    [id, workoutQuery.data, workoutStorage],
  );

  const originalWeights = useMemo(
    () =>
      workoutQuery.data?.exercises.map(exercise => ({
        id: exercise.id,
        sets: exercise.sets.map(set => set.weight),
      })) ?? [],
    [workoutQuery.data],
  );

  const weightChanges = useMemo(
    () =>
      workout?.exercises
        .filter(exercise =>
          exercise.sets.some(
            (set, i) =>
              set.weight !== originalWeights.find(({ id }) => id === exercise.id)?.sets[i],
          ),
        )
        .map(exercise => ({
          id: exercise.id,
          sets: exercise.sets.map(set => set.weight),
        })) ?? [],
    [workout, originalWeights],
  );

  const updateWeights = api.workout.updateWeightsBySession.useMutation({});

  const setWorkout = useCallback(
    (
      newWorkout:
        | Partial<NonNullable<typeof workout>>
        | ((previousWorkout: NonNullable<typeof workout>) => Partial<NonNullable<typeof workout>>),
    ) => {
      if (!workout) return;

      const partialWorkout = typeof newWorkout === "function" ? newWorkout(workout) : newWorkout;
      const updatedWorkout = { ...workout, ...partialWorkout };

      const completedIndex =
        partialWorkout.exercises?.findIndex((exercise, index) => {
          const isCompleted = exercise.sets.every(set => set.completed);
          const wasntCompleted = workout?.exercises[index]!.sets.some(set => !set.completed);
          return isCompleted && wasntCompleted;
        }) ?? -1;

      if (completedIndex !== -1) {
        const biSet = updatedWorkout.biSets.find(biSet =>
          biSet.includes(updatedWorkout.exercises[completedIndex]!.id),
        );

        if (biSet) {
          const [a, b] = biSet;
          updatedWorkout.exercises.find(e => e.id === a)!.collapsed = true;
          updatedWorkout.exercises.find(e => e.id === b)!.collapsed = true;
        } else {
          updatedWorkout.exercises[completedIndex]!.collapsed = true;
        }

        const nextIndex = updatedWorkout.exercises.findIndex(
          (e, i) => i > completedIndex && e.sets.some(set => !set.completed),
        );
        if (nextIndex !== -1) {
          updatedWorkout.exercises[nextIndex]!.collapsed = false;
        }
      }

      setWorkoutStorage(s => ({ ...s, [id]: updatedWorkout }));
    },
    [id, workout, setWorkoutStorage],
  );

  const setExercises = useCallback(
    (ids: string[]) =>
      (newExercise: Partial<Exercise> | ((exercise: Exercise) => Partial<Exercise>)) => {
        setWorkout(w => ({
          exercises: w.exercises.map(exercise => {
            if (ids.includes(exercise.id)) {
              const partialExercise =
                typeof newExercise === "function" ? newExercise(exercise) : newExercise;
              return { ...exercise, ...partialExercise };
            }
            return exercise;
          }),
        }));
      },
    [setWorkout],
  );

  const setExercise = useCallback(
    (id: string) =>
      (newExercise: Partial<Exercise> | ((exercise: Exercise) => Partial<Exercise>)) => {
        setExercises([id])(newExercise);
      },
    [setExercises],
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

  const handleInfo = (exercise: Exercise["exercise"]) => () => {
    setShowImageModal(exercise);
  };

  return (
    <FullPage>
      {showImageModal && (
        <Modal
          onClickOutside={() => setShowImageModal(null)}
          buttons={
            <button
              onClick={() => setShowImageModal(null)}
              className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fechar
            </button>
          }
        >
          <h1 className="self-center font-medium">{showImageModal.name}</h1>

          {selectedExerciseImage.isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner className="m-16 h-24 w-24 fill-blue-600 text-gray-200" />
            </div>
          ) : selectedExerciseImage.data ? (
            <div className="relative h-72 w-72">
              <Image
                src={selectedExerciseImage.data}
                className="h-full w-full rounded-md object-cover"
                alt={showImageModal.name}
                fill
              />
            </div>
          ) : (
            <h2>Não há imagem para {showImageModal.name}.</h2>
          )}
        </Modal>
      )}

      <QueryErrorAlert queries={[workoutQuery]} />
      <div className="flex flex-row items-center bg-gold-500 p-2">
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
      <div className="flex grow flex-col items-center overflow-y-auto">
        <div className="min-h-full w-full max-w-[48rem]">
          {!workout && workoutQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            groups?.map(group => {
              if ("exercises" in group) {
                const [first, second] = group.exercises;
                return (
                  <BiSetCard
                    handleInfo={handleInfo}
                    key={group.id}
                    first={first}
                    second={second}
                    originalWeights={originalWeights}
                    timerOn={timerOn}
                    setExercises={setExercises}
                    collapsed={first.collapsed && second.collapsed}
                  />
                );
              }

              const exercise = group;
              return (
                <ExerciseCard
                  handleInfo={handleInfo}
                  key={exercise.id}
                  exercise={exercise}
                  originalWeights={originalWeights.find(({ id }) => id === exercise.id)?.sets}
                  setCollapsed={collapsed => setExercise(exercise.id)({ collapsed })}
                  timerOn={timerOn}
                  setSetCompleted={setIndex => completed => {
                    setExercise(exercise.id)(e => ({
                      sets: e.sets.map((set, i) => (i === setIndex ? { ...set, completed } : set)),
                    }));
                  }}
                  setSetWeight={setIndex => weight => {
                    setExercise(exercise.id)(e => ({
                      sets: e.sets.map((set, i) => (i === setIndex ? { ...set, weight } : set)),
                    }));
                  }}
                />
              );
            })
          )}
        </div>
      </div>
      <Footer
        workoutName={workout?.name}
        groups={groups}
        timer={timerStorage[id]}
        setTimer={timer => setTimerStorage({ [id]: timer })}
        resetStorage={resetWorkoutStorage}
        verifiedStorage={verifiedStorage}
        updateChanges={
          weightChanges.length > 0
            ? () =>
                new Promise(resolve => {
                  updateWeights.mutate(
                    { workoutId: id, exercises: weightChanges },
                    { onSuccess: resolve },
                  );
                }).then(() => void workoutQuery.refetch())
            : undefined
        }
      />
    </FullPage>
  );
};

type ExerciseCardProps = {
  exercise: Exercise;
  originalWeights?: string[];
  timerOn: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  setSetCompleted: (setIndex: number) => (completed: boolean) => void;
  setSetWeight: (setIndex: number) => (weight: string) => void;
  handleInfo: (exercise: Exercise["exercise"]) => () => void;
};

const ExerciseCard = ({
  exercise,
  originalWeights,
  timerOn,
  setCollapsed,
  setSetCompleted,
  setSetWeight,
  handleInfo,
}: ExerciseCardProps) => {
  const [showAlert, setShowAlert] = useState(false);

  const uncollapsible = setCollapsed === undefined;

  const isCollapsed = exercise.collapsed && !uncollapsible;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white pt-2 shadow-md">
      {showAlert && (
        <Alert
          icon={
            <InformationIcon className="h-10 w-10 rounded-full bg-blue-200 p-2 text-blue-600" />
          }
          title={methodTranslation[exercise.method]}
          footer={
            <button
              className="rounded-md bg-gold-400 py-2 px-4 font-medium shadow-md"
              onClick={() => setShowAlert(false)}
            >
              Entendi
            </button>
          }
          onClickOutside={() => setShowAlert(false)}
        >
          {methodExplanation[exercise.method]}
        </Alert>
      )}
      <div
        className={classList("absolute left-4 text-sm transition-all", {
          "top-4": isCollapsed,
          "top-2": !isCollapsed,
        })}
      >
        <span className="font-medium text-blue-600">{exercise.exercise.name}</span>
      </div>
      {!uncollapsible && (
        <button
          className={classList(
            "absolute right-2 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md hover:bg-gray-300 hover:text-white",
          )}
          onClick={() => setCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
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
          <div className="flex h-10 flex-row items-center justify-between">
            <div className="flex flex-none flex-row flex-wrap items-center">
              <div className="flex flex-col">
                <div className="opacity-0">{exercise.exercise.name}asdasd</div>
                <div className="text-xs text-slate-600">{exercise.exercise.category}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            {exercise.method !== "Standard" ? (
              <div className={classList("text-xs", { "mr-10": !uncollapsible })}>
                <button className="flex items-center gap-1" onClick={() => setShowAlert(true)}>
                  <span className="text-right">{methodTranslation[exercise.method]}</span>
                  <InformationIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div />
            )}
            <button onClick={handleInfo(exercise.exercise)} className="pr-[2px] pt-2">
              <PhotoIcon className="h-5 w-5 text-black" />
            </button>
          </div>
        </div>
        {exercise.description && (
          <div className="mx-2 mb-2 rounded-md border-1 p-2 text-sm text-slate-800 shadow-inner">
            {exercise.description}
          </div>
        )}
        <div className="mt-2 flex flex-col text-sm text-slate-800">
          {exercise.sets.map((set, i) => (
            <MemoedSet
              key={i}
              index={i}
              set={set}
              originalWeight={originalWeights?.[i]}
              timerOn={timerOn}
              setCompleted={setSetCompleted(i)}
              setWeight={setSetWeight(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

type SetProps = {
  index: number;
  set: Exercise["sets"][number];
  originalWeight?: string;
  timerOn: boolean;
  setCompleted: (completed: boolean) => void;
  setWeight: (weight: string) => void;
};

const Set = ({ index, set, originalWeight, timerOn, setCompleted, setWeight }: SetProps) => {
  return (
    <div className="mx-2 mb-2 flex items-center justify-between rounded-md border-1 p-1.5 pl-3 shadow-md">
      <div className="font-medium">{index + 1}.</div>

      <div className="flex items-center gap-1">
        <div className="flex h-full w-20 flex-col gap-1">
          <SmallTextInput
            label="Peso"
            className={classList("inline-block h-8 w-full bg-white text-center", {
              "font-medium": originalWeight !== undefined && set.weight !== originalWeight,
            })}
            value={set.weight}
            onChange={setWeight}
          />
        </div>
        {originalWeight !== undefined && originalWeight !== set.weight ? (
          <button className="rounded-full p-2" onClick={() => setWeight(originalWeight)}>
            <ArrowUturnLeftIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>

      {"time" in set ? (
        <div>
          <span>Tempo: </span>
          <span className="font-medium">{set.time > 60 && `${Math.floor(set.time / 60)}min`}</span>
          <span className="font-medium">{set.time % 60 > 0 && ` ${set.time % 60}s`}</span>
        </div>
      ) : (
        <div>
          <span className="font-medium">{set.reps}</span>
          <span> {set.reps !== "1" ? "repetições" : "repetição"}</span>
        </div>
      )}
      {timerOn ? (
        <button
          className={classList("h-8 w-8 border-2 text-green-600 transition-all", {
            "rounded-lg border-slate-400": !set.completed,
            "rounded-2xl border-green-600": set.completed,
          })}
          onClick={() => setCompleted(!set.completed)}
        >
          <div className="flex h-full w-full items-center justify-center">
            {set.completed && <CheckIcon className="h-full w-full p-1" />}
          </div>
        </button>
      ) : (
        <div className="h-8 w-8 p-2" />
      )}
    </div>
  );
};

const MemoedSet = memo(Set);

type BiSetCardProps = {
  first: Exercise;
  second: Exercise;
  originalWeights: { id: string; sets: string[] }[];
  timerOn: boolean;
  setExercises: (
    ids: string[],
  ) => (exercise: Partial<Exercise> | ((exercise: Exercise) => Partial<Exercise>)) => void;
  collapsed: boolean;
  handleInfo: (exercise: Exercise["exercise"]) => () => void;
};

const BiSetCard = ({
  first,
  second,
  originalWeights,
  timerOn,
  setExercises,
  collapsed,
  handleInfo,
}: BiSetCardProps) => {
  const both = [first.id, second.id];

  const setSetCompleted = (setIndex: number) => (completed: boolean) => {
    setExercises(both)(e => ({
      sets: e.sets.map((set, i) => (i === setIndex ? { ...set, completed } : set)),
    }));
  };

  const setSetWeight = (id: string) => (setIndex: number) => (weight: string) => {
    setExercises([id])(e => ({
      sets: e.sets.map((set, i) => (i === setIndex ? { ...set, weight } : set)),
    }));
  };

  return (
    <div className="relative m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="absolute left-4 top-4">
        <span className="font-medium text-gray-50">Bi-set</span>
      </div>
      <button
        className="absolute right-2 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md hover:bg-gray-300 hover:text-white"
        onClick={() => setExercises(both)({ collapsed: !collapsed })}
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
            handleInfo={handleInfo}
            exercise={first}
            originalWeights={originalWeights.find(({ id }) => id === first.id)?.sets}
            timerOn={timerOn}
            setSetCompleted={setSetCompleted}
            setSetWeight={setSetWeight(first.id)}
          />
          <ExerciseCard
            handleInfo={handleInfo}
            exercise={second}
            originalWeights={originalWeights.find(({ id }) => id === second.id)?.sets}
            timerOn={timerOn}
            setSetCompleted={setSetCompleted}
            setSetWeight={setSetWeight(second.id)}
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

const exerciseToApi = (exercise: Exercise) => {
  return {
    exercise: {
      id: exercise.exercise.id,
      name: exercise.exercise.name,
      category: exercise.exercise.category,
    },
    description: exercise.description,
    method: exercise.method,
    sets: exercise.sets,
  };
};

const groupToApi = (group: Exercise | ExerciseGroup) => {
  if ("exercises" in group) {
    const [first, second] = group.exercises;
    return {
      exercises: [exerciseToApi(first), exerciseToApi(second)] as [
        ReturnType<typeof exerciseToApi>,
        ReturnType<typeof exerciseToApi>,
      ],
    };
  }
  return exerciseToApi(group);
};

type FooterProps = {
  workoutName?: string;
  groups?: (ExerciseGroup | Exercise)[];
  timer?: Timer;
  setTimer: (timer: Timer) => void;
  resetStorage: () => void;
  verifiedStorage: boolean;
  updateChanges?: () => Promise<void>;
};

const Footer = ({
  workoutName,
  groups,
  timer,
  setTimer,
  resetStorage,
  verifiedStorage,
  updateChanges,
}: FooterProps) => {
  const [state, setState] = useState<"not-started" | "started" | "finished">("not-started");

  const [showFinishAlert, setShowFinishAlert] = useState(false);
  const [showFinishedAlert, setShowFinishedAlert] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);

  const finishWorkout = api.finishedWorkout.create.useMutation({
    onSuccess: () => {
      setState("finished");
      pause();
      setTimer({
        startedAt: timer?.startedAt ?? new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      });
      setShowFinishAlert(false);
      setShowFinishedAlert(true);
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

  const workout = workoutName &&
    groups &&
    timer?.startedAt && {
      name: workoutName,
      exercises: groups.map(groupToApi),
      startedAt: new Date(timer.startedAt),
    };

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
          <div className="flex items-center gap-2">
            {updateChanges && (
              <button
                className="flex items-center gap-3 rounded-full border-2 border-blue-600 bg-blue-600 px-6 py-2 font-medium text-white"
                onClick={() => setShowUpdateAlert(true)}
              >
                Salvar alterações <CheckCircleIcon className="h-6 w-6" />
              </button>
            )}
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
                className="flex items-center gap-3 rounded-full border-2 border-green-600 bg-green-600 px-6 py-2 font-medium text-white"
                onClick={() => setShowFinishAlert(true)}
              >
                Concluir treino
                <CheckCircleIcon className="h-6 w-6" />
              </button>
            ) : (
              <div className="flex items-center border-2 border-transparent px-6 py-2 font-medium text-green-600">
                Treino finalizado
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-slate-900/500 font-medium">Buscando dados do treino...</div>
      )}

      {showFinishAlert && workout && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-600" />
          }
          title="Finalizar treino"
          footer={
            <>
              {updateChanges ? (
                <>
                  <button
                    className="rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md"
                    onClick={() => {
                      void updateChanges().then(() => finishWorkout.mutate(workout));
                    }}
                  >
                    Salvar e finalizar
                  </button>
                  <button
                    className="rounded-md border-1 border-red-500 bg-red-500 py-2 px-4 text-white shadow-md"
                    onClick={() => finishWorkout.mutate(workout)}
                  >
                    Finalizar sem salvar
                  </button>
                </>
              ) : (
                <button
                  className="rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md"
                  onClick={() => finishWorkout.mutate(workout)}
                >
                  Confirmar
                </button>
              )}
              <button
                className="rounded-md border-1 py-2 px-4 shadow-md"
                onClick={() => setShowFinishAlert(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          {`Tem certeza que deseja finalizar o treino?${
            updateChanges ? " Há alterações nos pesos dos exercícios que não foram salvas." : ""
          }`}
        </Alert>
      )}
      {showFinishedAlert && workout && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-200 p-2 text-green-600" />}
          title="Parabéns!"
          onClickOutside={() => setShowFinishedAlert(false)}
          footer={
            <>
              <button
                className="mx-4 rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md"
                onClick={() => setShowFinishedAlert(false)}
              >
                Concluir
              </button>
              <div className="mt-2 flex w-full items-center justify-center">
                <Image src="/logo-full.png" width={100} height={100} alt="logo" />
              </div>
            </>
          }
        >
          <div className="mx-4">
            <div className="mt-2 text-center">
              {`O treino ${workout.name} foi finalizado com sucesso em ${fixTimer(
                hours,
              )}h ${fixTimer(minutes)}min ${fixTimer(seconds)}s!
            `}
            </div>
            <div className="mb-4 mt-2  text-center font-bold">
              {`"${
                motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)] ?? ""
              }"`}
            </div>
          </div>
        </Alert>
      )}
      {updateChanges && showUpdateAlert && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-600" />
          }
          title="Salvar alterações"
          footer={
            <>
              <button
                className="rounded-md border-1 border-green-600 bg-green-600 py-2 px-4 text-white shadow-md"
                onClick={() => {
                  void updateChanges().then(() => setShowUpdateAlert(false));
                }}
              >
                Confirmar
              </button>
              <button
                className="rounded-md border-1 py-2 px-4 shadow-md"
                onClick={() => setShowUpdateAlert(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          Tem certeza que deseja salvar as alterações nos pesos dos exercícios?
        </Alert>
      )}
    </div>
  );
};

const fixTimer = (num: number) => num.toString().padStart(2, "0");

export default Workout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
