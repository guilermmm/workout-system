import { Method, Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
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
import { classList } from "../../../utils";
import { api, type RouterOutputs } from "../../../utils/api";
import { methodTranslation, weekdaysOrder, weekdaysTranslation } from "../../../utils/consts";
import type { Sets } from "../../../utils/types";

type Exercise = {
  id: number;
  exerciseId: string;
  description: string | null;
  method: Method;
  sets: Sets;
};

type ExerciseGroup = { id: number; exercises: readonly [Exercise, Exercise] };

type Categories = RouterOutputs["exercise"]["getGroups"];

const CreateWorkout = () => {
  const router = useRouter();

  const idGenerator = useRef(1);

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const categories = api.exercise.getGroups.useQuery();

  const { mutate } = api.workout.create.useMutation({ onSuccess: () => router.back() });

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [biSets, setBiSets] = useState<[number, number][]>([]);
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);
  const [name, setName] = useState("");

  const [saving, setSaving] = useState(false);

  if (profile.error || categories.error) {
    return <ErrorPage />;
  }

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: idGenerator.current++,
        exerciseId: "",
        sets: [],
        description: "",
        method: Method.Standard,
      },
    ]);
  };

  const handleSave = () => {
    setSaving(true);
    mutate(
      {
        name,
        profileId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exercises: exercises.map(({ id, ...exercise }, index) => ({ ...exercise, index })),
        biSets: biSets.map(([a, b]) => [
          exercises.findIndex(e => e.id === a)!,
          exercises.findIndex(e => e.id === b)!,
        ]),
      },
      {
        onSuccess: () => {
          setSaving(false);
          router.back();
        },
      },
    );
  };

  const groups: (ExerciseGroup | Exercise)[] = exercises.reduce((acc, exercise) => {
    const isAlreadyInAGroup = acc.find(
      g => "exercises" in g && g.exercises.find(e => e.id === exercise.id),
    );
    if (isAlreadyInAGroup) {
      return acc;
    }

    const biSet = biSets.find(([a, b]) => a === exercise.id || b === exercise.id);
    if (biSet) {
      const [a, b] = biSet;
      const group =
        a === exercise.id
          ? ([exercise, exercises.find(e => e.id === b)!] as const)
          : ([exercises.find(e => e.id === a)!, exercise] as const);

      return [...acc, { id: group.reduce((n, e) => (n > e.id ? n : e.id), 0), exercises: group }];
    }

    return [...acc, exercise];
  }, [] as (ExerciseGroup | Exercise)[]);

  const handleChangeGroups = (newGroups: typeof groups) => {
    const newExercises = newGroups.flatMap(g => ("exercises" in g ? g.exercises : g));
    const newBiSets = newGroups
      .filter(g => "exercises" in g)
      .map(g => (g as ExerciseGroup).exercises)
      .map(([a, b]) => [a.id, b.id] as [number, number]);

    setExercises(newExercises);
    setBiSets(newBiSets);
  };

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

      <div className="flex grow flex-col overflow-y-scroll">
        <div className="flex flex-col gap-2 bg-white py-4 px-2 sm:flex-row">
          <TextInput
            label="Nome do treino"
            model="outline"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            value={name}
            onChange={setName}
          />
          <MultiSelect
            label="Dias da semana"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            options={Object.values(Weekday)}
            onChange={days => setWeekdays(days.sort((a, b) => weekdaysOrder[a] - weekdaysOrder[b]))}
            selected={weekdays}
            itemToString={it => weekdaysTranslation[it]}
            itemToKey={it => it}
          />
        </div>
        {categories.isLoading ? (
          <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
        ) : (
          <Sortable.List items={groups} onChange={handleChangeGroups}>
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
                        key={group.id}
                        first={a}
                        second={b}
                        setBiSets={setBiSets}
                        setExercises={setExercises}
                        categories={categories.data}
                        dragHandle={dragHandle}
                        collapsed={animating}
                      />
                    );
                  }

                  const exercise = group;
                  return (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      setBiSets={setBiSets}
                      onEdit={it => {
                        setExercises(exercises.map(e => (e.id === exercise.id ? it : e)));
                      }}
                      onDelete={() => setExercises(exercises.filter(e => e.id !== exercise.id))}
                      categories={categories.data}
                      otherExercises={exercises.filter(
                        ({ id, exerciseId }) =>
                          id !== exercise.id &&
                          !biSets.some(([a, b]) => a === id || b === id) &&
                          exerciseId !== "",
                      )}
                      dragHandle={dragHandle}
                      collapsed={animating}
                    />
                  );
                })()}
              </Sortable.Item>
            )}
          </Sortable.List>
        )}
        <div className="flex flex-row items-center justify-center">
          <button
            className="mt-2 flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-500 px-6 py-2 font-medium text-white hover:border-blue-600 hover:bg-blue-600"
            onClick={handleAddExercise}
          >
            Adicionar exercício
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 p-4">
        <button
          className="flex items-center gap-3 rounded-full border-2 border-green-200 bg-green-500 px-6 py-2 font-medium text-white hover:border-green-600 hover:bg-green-600 disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500"
          onClick={handleSave}
          disabled={name === "" || exercises.length === 0 || weekdays.length === 0 || saving}
        >
          {saving ? "Salvando..." : "Salvar treino"}
          {!saving && name !== "" && exercises.length !== 0 && weekdays.length !== 0 && (
            <CheckCircleIcon className="h-8 w-8" />
          )}
          {saving && <Spinner className="h-8 w-8 fill-blue-600 text-gray-200" />}
        </button>
      </div>
    </FullPage>
  );
};

type ExerciseCardProps = {
  exercise: Exercise;
  setBiSets?: Dispatch<SetStateAction<[number, number][]>>;
  onEdit: (exercise: Exercise) => void;
  onDelete?: () => void;
  categories: Categories;
  otherExercises?: Exercise[];
  dragHandle?: React.ReactNode;
  collapsed?: boolean;
};

const ExerciseCard = ({
  exercise,
  setBiSets,
  onEdit,
  onDelete,
  categories,
  otherExercises,
  dragHandle,
  collapsed,
}: ExerciseCardProps) => {
  const [type, setType] = useState<"reps" | "time">("reps");

  const [hidden, setHidden] = useState(false);

  const [sets, setSets] = useState(() =>
    exercise.sets.length > 0
      ? exercise.sets.map(set => ({
          weight: set.weight,
          reps: "reps" in set ? set.reps : 0,
          time: "time" in set ? set.time : 0,
        }))
      : [{ reps: 0, weight: 0, time: 0 }],
  );
  const [biSet, setBiSet] = useState<number>();

  useEffect(() => {
    if (!setBiSets) return;

    if (biSet) {
      setBiSets(biSets => {
        const thisBiSet = biSets.find(([a]) => a === exercise.id);

        if (thisBiSet) {
          return biSets.map(biSetEl => (biSetEl === thisBiSet ? [exercise.id, biSet] : biSetEl));
        } else {
          return [...biSets, [exercise.id, biSet]];
        }
      });
    } else {
      setBiSets(biSets => biSets.filter(([a]) => a !== exercise.id));
    }
  }, [exercise.id, biSet, setBiSets]);

  const updateSets = (newSets: typeof sets) => {
    if (newSets.length === 0) {
      newSets = [{ reps: 0, weight: 0, time: 0 }];
    }

    setSets(newSets);

    if (type === "reps") {
      onEdit({ ...exercise, sets: newSets.map(set => ({ reps: set.reps, weight: set.weight })) });
    } else {
      onEdit({ ...exercise, sets: newSets.map(set => ({ time: set.time, weight: set.weight })) });
    }
  };

  const updateMethod = (newMethod: Method) => {
    onEdit({ ...exercise, method: newMethod });
  };

  const updateType = (newType: typeof type) => {
    setType(newType);

    if (newType === "reps") {
      onEdit({ ...exercise, sets: sets.map(set => ({ reps: set.reps, weight: set.weight })) });
    } else {
      onEdit({ ...exercise, sets: sets.map(set => ({ time: set.time, weight: set.weight })) });
    }
  };

  const handleSelectExercise: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const newExercise = categories
      .flatMap(group => group.exercises)
      .find(exercise => exercise.id === e.target.value);

    if (newExercise) {
      onEdit({ ...exercise, exerciseId: newExercise.id });
    }
  };

  const isCollapsed = collapsed || hidden;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white p-2 shadow-md">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <button
        className={classList(
          "absolute rounded-full p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
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
          {categories.flatMap(g => g.exercises).find(e => e.id === exercise.exerciseId)?.name}
        </div>
        <div className="w-1/3 text-xs text-gray-500">
          {exercise.sets.length || 1} série{exercise.sets.length > 1 ? "s" : ""}
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
                  defaultValue=""
                  model="outline"
                  label="Exercício"
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
                  defaultValue="Standard"
                  model="outline"
                  label="Método"
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
                model="outline"
                // rows={exercise.description?.split("\n").length ?? 1}
              />
            </div>
            {onDelete ? (
              <div className="mt-24 ml-2 mr-0 flex flex-col items-start gap-2 sm:mr-24 sm:mt-0 sm:flex-row-reverse">
                <button
                  className="rounded-full p-2 text-red-400 shadow-md transition-colors hover:bg-red-500 hover:text-white"
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
          <div className="flex grow flex-col gap-2">
            <div className="flex grow flex-col items-center justify-center">
              <div className="inline-flex">
                <span className="mr-1 text-xs font-medium text-gray-900">Reps</span>
                <label className="relative cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={type === "time"}
                    onChange={e => updateType(e.target.checked ? "time" : "reps")}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
                </label>
                <span className="ml-1 text-xs font-medium text-gray-900">Tempo</span>
              </div>
            </div>
            <div className="flex grow flex-col">
              {otherExercises && otherExercises.length !== 0 && (
                // TODO: switch to a dropdown
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
          <div className="flex flex-col text-sm">
            <div className="m-2 flex flex-col rounded-md px-2 py-1 font-medium shadow-md">
              <span className="text-slate-700">Séries</span>
              {sets.map((set, index) => (
                <div
                  className="m-0.5 flex flex-row items-center justify-between rounded border-1 bg-white p-1.5 shadow-md"
                  key={index}
                >
                  <div className="flex flex-row items-center gap-2">
                    {/* <div className="flex grow items-center"> */}
                    <NumberInput
                      label={type === "reps" ? "Reps" : "Tempo"}
                      className="bg-white"
                      value={type === "reps" ? set.reps : set.time}
                      onChange={n => {
                        const newSets = [...sets];
                        newSets[index]![type === "reps" ? "reps" : "time"] = n;
                        updateSets(newSets);
                      }}
                      min={0}
                      model="outline"
                      suffix={type === "time" ? ["seg", "pr-9"] : undefined}
                    />
                    {/* </div> */}
                    {/* <div className="flex grow items-center"> */}
                    <NumberInput
                      label="Peso"
                      className="bg-white"
                      value={set.weight}
                      onChange={n => {
                        const newSets = [...sets];
                        newSets[index]!.weight = n;
                        updateSets(newSets);
                      }}
                      min={0}
                      step={0.25}
                      model="outline"
                      suffix={["kg", "pr-7"]}
                    />
                    {/* </div> */}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {sets.length !== 1 && (
                      <button
                        className="p-1 text-red-500"
                        onClick={() => {
                          const newSets = [...sets];
                          newSets.splice(index, 1);
                          updateSets(newSets);
                        }}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="m-0.5 flex items-center justify-center">
                <button
                  className="rounded-full p-1.5 shadow-md hover:bg-gray-100"
                  onClick={() => {
                    const lastSet = sets.at(-1);
                    if (lastSet) {
                      updateSets([...sets, { ...lastSet }]);
                    } else {
                      updateSets([{ reps: 0, weight: 0, time: 0 }]);
                    }
                  }}
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
  setBiSets: Dispatch<SetStateAction<[number, number][]>>;
  setExercises: Dispatch<SetStateAction<Exercise[]>>;
  categories: Categories;
  dragHandle: React.ReactNode;
  collapsed: boolean;
};

const BiSetCard: React.FC<BiSetCardProps> = ({
  first,
  second,
  setBiSets,
  setExercises,
  categories,
  dragHandle,
  collapsed,
}: BiSetCardProps) => {
  return (
    <div className="relative m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <div className="absolute left-4 top-4">
        <span className="font-medium text-gray-50">Bi-set</span>
      </div>
      <div
        className={classList("h-12 transition-all duration-200", {
          "max-h-[3rem]": !!collapsed,
          "max-h-0 overflow-y-hidden": !collapsed,
        })}
      >
        <div className="flex h-full items-center justify-center pb-2">
          <div className="flex flex-row gap-2 text-sm text-gray-50">
            <span>
              {categories.flatMap(g => g.exercises).find(e => e.id === first.exerciseId)?.name}
            </span>
            <span>x</span>
            <span>
              {categories.flatMap(g => g.exercises).find(e => e.id === second.exerciseId)?.name}
            </span>
          </div>
        </div>
      </div>
      <div
        className={classList("flex flex-col transition-all duration-200", {
          "max-h-[100rem]": !collapsed,
          "max-h-0 overflow-y-hidden": !!collapsed,
        })}
      >
        <div className="flex flex-row items-center justify-between px-2">
          <div />
          <button
            className="mr-12 flex justify-center rounded-full bg-slate-50 p-2 text-blue-500 transition-colors hover:bg-slate-200 hover:text-blue-600"
            onClick={() => {
              setBiSets(biSets => biSets.filter(([a, b]) => a !== first.id && b !== second.id));
            }}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col items-stretch">
          <ExerciseCard
            exercise={first}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === first.id ? it : e)))
            }
          />
          <ExerciseCard
            exercise={second}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === second.id ? it : e)))
            }
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
