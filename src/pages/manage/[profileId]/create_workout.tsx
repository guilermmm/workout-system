import { Method, Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import Dropdown from "../../../components/Dropdown";
import ErrorPage from "../../../components/ErrorPage";
import FullPage from "../../../components/FullPage";
import MultiSelect from "../../../components/MultiSelect";
import NumberInput from "../../../components/NumberInput";
import ProfilePic from "../../../components/ProfilePic";
import Select from "../../../components/Select";
import Sortable from "../../../components/SortableList";
import Spinner from "../../../components/Spinner";
import TextArea from "../../../components/TextArea";
import TextInput from "../../../components/TextInput";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import Bars2Icon from "../../../components/icons/Bars2Icon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import ChevronDownIcon from "../../../components/icons/ChevronDownIcon";
import ChevronUpIcon from "../../../components/icons/ChevronUpIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { classList, useFormValidation, useLocalStorage } from "../../../utils";
import { api, type RouterOutputs } from "../../../utils/api";
import { methodTranslation, weekdaysOrder, weekdaysTranslation } from "../../../utils/consts";

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
  weekdays: z.array(z.nativeEnum(Weekday)),
  exercises: z.array(exerciseParser),
});

type ExerciseGroup = { id: number; exercises: readonly [Exercise, Exercise] };

type Categories = RouterOutputs["exercise"]["getGroups"];

const CreateWorkout = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const categories = api.exercise.getGroups.useQuery();

  const { mutate } = api.workout.create.useMutation();

  const [workout, setWorkout, resetWorkout] = useLocalStorage("create-workout", workoutParser, {
    name: "",
    exercises: [],
    weekdays: [],
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
          setSaving(false);
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
    workout.weekdays.length > 0 &&
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
                weekdays: days.sort((a, b) => weekdaysOrder[a] - weekdaysOrder[b]),
              })
            }
            selected={workout.weekdays}
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
                  const dragHandle = (
                    <Sortable.DragHandle className="rounded-full bg-white p-2 text-gray-400 shadow-md transition-colors hover:bg-gray-300 hover:text-white">
                      <Bars2Icon className="h-6 w-6" />
                    </Sortable.DragHandle>
                  );

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
          {saving ? "Salvando..." : "Salvar treino"}
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

type ExerciseCardProps = {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete?: () => void;
  categories: Categories;
  otherExercises?: Exercise[];
  dragHandle?: React.ReactNode;
  collapsed?: boolean;
  disabled?: boolean;
};

const ExerciseCard = ({
  exercise,
  onEdit,
  onDelete,
  categories,
  otherExercises,
  dragHandle,
  collapsed,
  disabled,
}: ExerciseCardProps) => {
  const exerciseIdProps = useFormValidation(
    exercise.exerciseId,
    v => v === "" && "Selecione um exercício",
    true,
  );

  const updateSets = (newSets: typeof exercise.sets) => {
    if (newSets.length === 0) {
      newSets = [{ reps: 0, weightKg: 0, time: { minutes: 0, seconds: 0 } }];
    }

    onEdit({ ...exercise, sets: newSets });
  };

  const updateMethod = (newMethod: Method) => onEdit({ ...exercise, method: newMethod });

  const updateType = (newType: typeof exercise.type) => onEdit({ ...exercise, type: newType });

  const setHidden = (hidden: boolean) => onEdit({ ...exercise, hidden });

  const handleSelectExercise: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const newExercise = categories
      .flatMap(group => group.exercises)
      .find(exercise => exercise.id === e.target.value);

    if (newExercise) {
      onEdit({ ...exercise, exerciseId: newExercise.id });
    }
  };

  const setBiSet = (biSet: number) => onEdit({ ...exercise, biSet });

  const isCollapsed = collapsed || exercise.hidden;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white p-2 shadow-md">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <button
        className={classList(
          "absolute rounded-full bg-white p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
          {
            "right-2 top-14 sm:right-14 sm:top-2": !!onDelete && !isCollapsed,
            "right-14 top-2": !!onDelete && isCollapsed,
            "right-2 top-2": !onDelete,
          },
        )}
        onClick={() => setHidden(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      <div
        className={classList(
          "flex h-10 flex-row items-center justify-between transition-all duration-200",
          {
            "max-h-[2.5rem]": !!isCollapsed,
            "max-h-0 overflow-y-hidden": !isCollapsed,
          },
        )}
      >
        <div className="ml-2 w-1/3 text-sm font-medium">
          {categories.flatMap(g => g.exercises).find(e => e.id === exercise.exerciseId)?.name ?? (
            <span className="rounded bg-slate-50 p-0.5 font-medium text-red-500">
              Exercício não selecionado
            </span>
          )}
        </div>
        <div className="w-1/3 text-xs text-gray-500">
          {exercise.sets.length || 1} {exercise.sets.length > 1 ? "séries" : "série"}
        </div>
        <div className="w-10" />
      </div>
      <div
        className={classList("flex flex-col justify-between gap-2 transition-all duration-200", {
          "max-h-[100rem]": !isCollapsed,
          "max-h-0 overflow-y-hidden": !!isCollapsed,
        })}
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex">
            <div className="flex grow flex-col gap-2">
              <div className="flex grow flex-col gap-2 bg-white py-1 sm:flex-row">
                <Select
                  className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
                  value={exercise.exerciseId}
                  onChange={handleSelectExercise}
                  label="Exercício"
                  disabled={disabled}
                  {...exerciseIdProps}
                >
                  <option value="" className="text-slate-600" disabled>
                    Selecione um exercício
                  </option>
                  {categories.map(group => (
                    <optgroup
                      label={group.category}
                      key={group.category}
                      className="my-2 block text-sm text-slate-700/70"
                    >
                      {group.exercises.map(e => (
                        <option key={e.id} className="text-blue-600" value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
                <Select
                  className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
                  value={exercise.method}
                  onChange={e => updateMethod(e.target.value as Method)}
                  label="Método"
                  disabled={disabled}
                >
                  {Object.values(Method).map(method => (
                    <option key={method} value={method} className="text-sm">
                      {methodTranslation[method]}
                    </option>
                  ))}
                </Select>
              </div>
              <TextArea
                className="h-full w-full rounded-lg bg-white"
                label="Descrição"
                value={exercise.description ?? ""}
                onChange={description => onEdit({ ...exercise, description })}
                disabled={disabled}
              />
            </div>
            {onDelete && !disabled ? (
              <div className="mt-24 ml-2 mr-0 flex flex-col items-start gap-2 sm:mr-24 sm:mt-0 sm:flex-row-reverse">
                <button
                  className="rounded-full bg-white p-2 text-red-400 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                  onClick={onDelete}
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="ml-12" />
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex grow-1 flex-col gap-2">
            <div className="flex grow flex-col items-center justify-center">
              <span
                className={classList("mb-1 text-xs font-medium", {
                  "text-gray-900": exercise.type === "reps",
                  "text-gray-500": exercise.type !== "reps",
                })}
              >
                Repetições
              </span>
              <div className="inline-flex">
                <label className="relative cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={exercise.type === "time"}
                    onChange={e => updateType(e.target.checked ? "time" : "reps")}
                    className="peer sr-only"
                    disabled={disabled}
                  />
                  <div
                    className={classList(
                      "peer h-5 w-9 rounded-full bg-blue-600",
                      "after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
                      "peer-checked:after:translate-x-full peer-checked:after:border-white",
                      "peer-focus:outline-none peer-focus:ring-0",
                      "disabled:after:bg-gray-300 peer-disabled:bg-gray-300",
                    )}
                  />
                </label>
              </div>
              <span
                className={classList("text-xs font-medium", {
                  "text-gray-900": exercise.type === "time",
                  "text-gray-500": exercise.type !== "time",
                })}
              >
                Tempo
              </span>
            </div>
            <div className="flex flex-col">
              {otherExercises && otherExercises.length !== 0 && (
                <div className="flex items-center justify-center overflow-visible">
                  <Dropdown
                    className="flex items-center justify-center"
                    options={otherExercises}
                    onSelect={e => setBiSet(e.id)}
                    itemToKey={e => e.id.toString()}
                    itemToString={exercise =>
                      categories
                        .flatMap(group => group.exercises)
                        .find(e => e.id === exercise.exerciseId)!.name
                    }
                    disabled={disabled}
                  >
                    {(_, toggle) => (
                      <button
                        className="flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 text-sm font-medium text-slate-900 shadow-md"
                        onClick={toggle}
                      >
                        Criar bi-set
                      </button>
                    )}
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
          <div className="flex grow-2 flex-col text-sm">
            <div className="flex flex-col items-center rounded-md px-2 py-1">
              <span className="mb-2 font-medium text-slate-700">Séries</span>
              {exercise.sets.map((set, index) => (
                <div
                  className="m-0.5 flex w-full items-center justify-between rounded border-1 bg-white p-1.5 shadow-md"
                  key={index}
                >
                  <div className="flex grow flex-row items-center gap-1">
                    {exercise.type === "reps" ? (
                      <NumberInput
                        label="Repetições"
                        className="grow bg-white"
                        value={set.reps}
                        onChange={n => {
                          const newSets = [...exercise.sets];
                          newSets[index]!.reps = n;
                          updateSets(newSets);
                        }}
                        min={0}
                        disabled={disabled}
                      />
                    ) : (
                      <>
                        <NumberInput
                          label="Minutos"
                          className="grow bg-white"
                          value={set.time.minutes}
                          onChange={n => {
                            const newSets = [...exercise.sets];
                            newSets[index]!.time.minutes = n;
                            updateSets(newSets);
                          }}
                          min={0}
                          max={1000}
                          disabled={disabled}
                        />
                        <NumberInput
                          label="Segundos"
                          className="grow bg-white"
                          value={set.time.seconds}
                          onChange={n => {
                            const newSets = [...exercise.sets];
                            newSets[index]!.time.seconds = n;
                            updateSets(newSets);
                          }}
                          min={0}
                          max={59}
                          disabled={disabled}
                        />
                      </>
                    )}
                    <NumberInput
                      label="Peso (kg)"
                      className="grow bg-white"
                      value={set.weightKg}
                      onChange={n => {
                        const newSets = [...exercise.sets];
                        newSets[index]!.weightKg = n;
                        updateSets(newSets);
                      }}
                      min={0}
                      step={0.01}
                      max={1000}
                      disabled={disabled}
                    />
                  </div>
                  {exercise.sets.length !== 1 && (
                    <div className="ml-1 flex items-center">
                      <button
                        className="rounded-full border-1 border-gray-300 p-1 text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          const newSets = [...exercise.sets];
                          newSets.splice(index, 1);
                          updateSets(newSets);
                        }}
                        disabled={disabled}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="m-0.5 w-full">
                <button
                  className="flex w-full items-center justify-center rounded border-1 bg-white p-1.5 shadow-md hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    const lastSet = exercise.sets.at(-1);
                    if (lastSet) {
                      updateSets([...exercise.sets, { ...lastSet }]);
                    } else {
                      updateSets([{ reps: 0, weightKg: 0, time: { minutes: 0, seconds: 0 } }]);
                    }
                  }}
                  disabled={disabled}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type BiSetCardProps = {
  first: Exercise;
  second: Exercise;
  separate: () => void;
  setExercises: (fn: (exercises: Exercise[]) => Exercise[]) => void;
  categories: Categories;
  dragHandle: React.ReactNode;
  collapsed: boolean;
  disabled?: boolean;
};

const BiSetCard: React.FC<BiSetCardProps> = ({
  first,
  second,
  separate,
  setExercises,
  categories,
  dragHandle,
  collapsed,
  disabled,
}: BiSetCardProps) => {
  const [hidden, setHidden] = useState(false);

  const isCollapsed = collapsed || hidden;

  const setCollapsed = (collapsed: boolean) => {
    setHidden(collapsed);
    const collapseExercises = () =>
      setExercises(exercises =>
        exercises.map(e =>
          e.id === first.id || e.id === second.id ? { ...e, hidden: collapsed } : e,
        ),
      );

    if (collapsed) {
      setTimeout(collapseExercises, 200);
    } else {
      collapseExercises();
    }
  };

  return (
    <div className="relative m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <div className="absolute left-4 top-4">
        <span className="font-medium text-gray-50">Bi-set</span>
      </div>
      <button
        className="absolute right-24 top-2 mr-2 flex justify-center rounded-full bg-slate-50 p-2 text-blue-500 transition-colors hover:bg-slate-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={separate}
        disabled={disabled}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <button
        className={classList(
          "absolute right-14 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
        )}
        onClick={() => setCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      <div
        className={classList("h-12 transition-all duration-200", {
          "max-h-[3rem]": !!isCollapsed,
          "max-h-0 overflow-y-hidden": !isCollapsed,
        })}
      >
        <div className="flex h-full items-center justify-center pb-2">
          <div className="flex gap-2 text-sm text-gray-50">
            <div>
              {categories.flatMap(g => g.exercises).find(e => e.id === first.exerciseId)?.name ?? (
                <span className="rounded bg-slate-50 p-0.5 font-medium text-red-500">
                  Exercício não selecionado
                </span>
              )}
            </div>
            <span>x</span>
            <div>
              {categories.flatMap(g => g.exercises).find(e => e.id === second.exerciseId)?.name ?? (
                <span className="rounded bg-slate-50 p-0.5 font-medium text-red-500">
                  Exercício não selecionado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={classList("flex flex-col transition-all duration-200", {
          "max-h-[100rem]": !isCollapsed,
          "max-h-0 overflow-y-hidden": !!isCollapsed,
        })}
      >
        <div className="h-10" />
        <div className="flex flex-col items-stretch">
          <ExerciseCard
            exercise={first}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === first.id ? it : e)))
            }
            disabled={disabled}
          />
          <ExerciseCard
            exercise={second}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === second.id ? it : e)))
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
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
