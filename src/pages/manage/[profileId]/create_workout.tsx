import { Method, Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import ErrorPage from "../../../components/ErrorPage";
import FullPage from "../../../components/FullPage";
import MultiSelect from "../../../components/MultiSelect";
import ProfilePic from "../../../components/ProfilePic";
import Sortable from "../../../components/SortableList";
import Spinner from "../../../components/Spinner";
import TextInput from "../../../components/TextInput";
import BiSetCard from "../../../components/admin/BiSetCard";
import ExerciseCard from "../../../components/admin/ExerciseCard";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import Bars2Icon from "../../../components/icons/Bars2Icon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { useLocalStorage } from "../../../utils";
import { api } from "../../../utils/api";
import { weekdaysOrder, weekdaysTranslation } from "../../../utils/consts";

const exerciseParser = z.object({
  id: z.number(),
  exerciseId: z.string(),
  description: z.string().nullable(),
  method: z.nativeEnum(Method),
  biSet: z.number().nullable(),
  type: z.union([z.literal("reps"), z.literal("time")]),
  sets: z.array(
    z.object({
      reps: z.number().min(1),
      weightKg: z.number().min(0),
      time: z.object({
        minutes: z.number().min(0),
        seconds: z.number().min(0).max(59),
      }),
    }),
  ),
  hidden: z.boolean(),
});

type Exercise = z.infer<typeof exerciseParser>;

const workoutParser = z.object({
  name: z.string(),
  days: z.array(z.nativeEnum(Weekday)),
  exercises: z.array(exerciseParser),
});

type ExerciseGroup = { id: number; exercises: readonly [Exercise, Exercise] };

const dragHandle = (
  <Sortable.DragHandle className="rounded-full bg-white p-2 text-gray-400 shadow-md transition-colors hover:bg-gray-300 hover:text-white">
    <Bars2Icon className="h-6 w-6" />
  </Sortable.DragHandle>
);

const CreateWorkout = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const categories = api.exercise.getGroups.useQuery();

  const { mutate } = api.workout.create.useMutation();

  const [workout, setWorkout, resetWorkout] = useLocalStorage("create-workout", workoutParser, {
    name: "",
    days: [],
    exercises: [],
  });

  const idGenerator = useRef(1);

  useEffect(() => {
    if (workout.exercises.length === 0) {
      idGenerator.current = 1;
    } else {
      idGenerator.current = Math.max(...workout.exercises.map(e => e.id)) + 1;
    }
  }, [workout.exercises]);

  const [saving, setSaving] = useState(false);

  const groups = useMemo(
    () =>
      workout.exercises.reduce((acc, exercise) => {
        const isAlreadyInAGroup = acc.find(
          g => "exercises" in g && g.exercises.find(e => e.id === exercise.id),
        );
        if (isAlreadyInAGroup) {
          return acc;
        }

        if (workout.exercises.some(e => e.biSet === exercise.id)) {
          return acc;
        }

        if (exercise.biSet !== null) {
          const group = [exercise, workout.exercises.find(e => e.id === exercise.biSet)!] as const;

          return [...acc, { id: exercise.id, exercises: group }];
        }

        return [...acc, exercise];
      }, [] as (ExerciseGroup | Exercise)[]),
    [workout.exercises],
  );

  if (profile.error || categories.error) {
    return <ErrorPage />;
  }

  const setExercises = (exercises: Exercise[] | ((exercises: Exercise[]) => Exercise[])) => {
    if (typeof exercises === "function") {
      setWorkout(prev => ({ ...prev, exercises: exercises(prev.exercises) }));
    } else {
      setWorkout(prev => ({ ...prev, exercises }));
    }
  };

  const handleAddExercise = () => {
    setExercises([
      ...workout.exercises,
      {
        id: idGenerator.current++,
        exerciseId: "",
        description: "",
        method: Method.Standard,
        type: "reps",
        hidden: false,
        sets: [{ reps: 1, weightKg: 0, time: { minutes: 0, seconds: 0 } }],
        biSet: null,
      },
    ]);
  };

  const handleSave = () => {
    setSaving(true);
    mutate(
      {
        name: workout.name,
        days: workout.days,
        profileId,
        exercises: workout.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          description: exercise.description,
          method: exercise.method,
          sets:
            exercise.type === "reps"
              ? exercise.sets.map(({ reps, weightKg }) => ({
                  reps,
                  weight: weightKg * 1000,
                }))
              : exercise.sets.map(({ time, weightKg }) => ({
                  time: time.minutes * 60 + time.seconds,
                  weight: weightKg * 1000,
                })),
          index,
        })),
        biSets: workout.exercises
          .map((exercise, index) => ({ ...exercise, index }))
          .filter(exercise => exercise.biSet !== null)
          .map(exercise => {
            const other = workout.exercises.findIndex(e => e.id === exercise.biSet);
            return [exercise.index, other] as [number, number];
          }),
      },
      {
        onSuccess: () => {
          resetWorkout();
          router.back();
        },
      },
    );
  };

  const handleChangeGroups = (newGroups: typeof groups) => {
    const newExercises = newGroups.flatMap(g => ("exercises" in g ? g.exercises : g));

    setExercises(newExercises);
  };

  const canSubmit =
    workout.name !== "" &&
    workout.days.length > 0 &&
    workout.exercises.length > 0 &&
    workout.exercises.every(e => e.exerciseId !== "");

  return (
    <FullPage>
      <div className="flex flex-row items-center justify-between bg-gold-500 p-2">
        <div className="flex flex-row items-center justify-between">
          <button
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => router.back()}
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center">
          <div className="flex max-w-[calc(100vw_-_144px)] flex-row items-center justify-between text-right">
            <div className="ml-4 flex flex-col truncate">
              {profile.data && (
                <>
                  <h1 className="truncate text-xl text-blue-700">
                    Criar treino para <span className="font-bold">{profile.data.user?.name}</span>
                  </h1>
                  <p className="truncate font-medium text-slate-700">{profile.data.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="ml-4">
            {profile.isLoading ? (
              <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
            ) : (
              <ProfilePic size="md" user={profile.data.user} />
            )}
          </div>
        </div>
      </div>

      <div className="flex grow flex-col items-center overflow-y-scroll">
        <div className="flex w-full flex-col gap-2 bg-white py-4 px-2 sm:flex-row">
          <TextInput
            label="Nome do treino"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            value={workout.name}
            onChange={name => setWorkout({ ...workout, name })}
          />
          <MultiSelect
            label="Dia(s)"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            options={Object.values(Weekday)}
            onChange={days =>
              setWorkout({
                ...workout,
                days: days.sort((a, b) => weekdaysOrder[a] - weekdaysOrder[b]),
              })
            }
            selected={workout.days}
            itemToString={it => weekdaysTranslation[it]}
            itemToKey={it => it}
            disabled={saving}
          />
        </div>
        {categories.isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
          </div>
        ) : (
          <Sortable.List
            className="w-full max-w-[48rem]"
            items={groups}
            onChange={handleChangeGroups}
          >
            {(group, animating) => (
              <Sortable.Item className="" id={group.id}>
                {(() => {
                  if ("exercises" in group) {
                    const [a, b] = group.exercises;

                    return (
                      <BiSetCard
                        first={a}
                        second={b}
                        separate={() => {
                          setExercises(
                            workout.exercises.map(e => (e.id === a.id ? { ...e, biSet: null } : e)),
                          );
                        }}
                        setExercises={setExercises}
                        categories={categories.data}
                        dragHandle={dragHandle}
                        collapsed={animating}
                        disabled={saving}
                      />
                    );
                  }

                  const exercise = group;
                  return (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onEdit={it => {
                        setExercises(workout.exercises.map(e => (e.id === exercise.id ? it : e)));
                      }}
                      onDelete={() =>
                        setExercises(workout.exercises.filter(e => e.id !== exercise.id))
                      }
                      categories={categories.data}
                      otherExercises={workout.exercises.filter(
                        other =>
                          other.id !== exercise.id &&
                          other.exerciseId !== "" &&
                          other.biSet === null &&
                          workout.exercises.find(e => e.biSet === other.id) === undefined,
                      )}
                      dragHandle={dragHandle}
                      collapsed={animating}
                      disabled={saving}
                    />
                  );
                })()}
              </Sortable.Item>
            )}
          </Sortable.List>
        )}
        {!categories.isLoading && (
          <div className="flex flex-row items-center justify-center">
            <button
              className="mt-2 flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-500 px-6 py-2 font-medium text-white hover:border-blue-600 hover:bg-blue-600 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
              onClick={handleAddExercise}
            >
              Adicionar exercício
              <PlusIcon className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 right-0 p-4">
        <button
          className="flex items-center gap-3 rounded-full border-2 border-green-200 bg-green-500 px-6 py-2 font-medium text-white hover:border-green-600 hover:bg-green-600 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
          onClick={handleSave}
          disabled={!canSubmit || saving}
        >
          {saving ? "Salvando..." : "Salvar"}
          {saving ? (
            <Spinner className="h-8 w-8 fill-blue-600 text-gray-200" />
          ) : (
            canSubmit && <CheckCircleIcon className="h-8 w-8" />
          )}
        </button>
      </div>
    </FullPage>
  );
};

export default CreateWorkout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
