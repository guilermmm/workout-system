import type { Exercise, ExerciseInWorkout } from "@prisma/client";
import { Method } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import ErrorPage from "../../../components/ErrorPage";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import ProfilePic from "../../../components/ProfilePic";
import Spinner from "../../../components/Spinner";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import { methodTranslation } from "../../../utils/consts";
import type { ParseJsonValues } from "../../../utils/types";

type NewExercise = ParseJsonValues<
  Omit<ExerciseInWorkout, "id" | "workoutId" | "createdAt" | "updatedAt" | "index"> & { id: number }
>;

const CreateWorkout = () => {
  const router = useRouter();

  const idGenerator = useRef(1);

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const categories = api.exercise.getCategories.useQuery();

  const { mutate } = api.workout.create.useMutation({ onSuccess: () => router.back() });

  const [exercises, setExercises] = useState<NewExercise[]>([]);

  const [biSets, setBiSets] = useState<[number, number][]>([]);

  const [name, setName] = useState("");

  useEffect(() => {
    console.log(biSets);
  }, [biSets]);

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
    mutate({
      name,
      profileId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exercises: exercises.map(({ id: _, ...e }, i) => ({ ...e, index: i })),
      biSets: biSets.map(([a, b]) => [
        exercises.findIndex(e => e.id === a)!,
        exercises.findIndex(e => e.id === b)!,
      ]),
    });
  };

  const groups: ([NewExercise, NewExercise] | NewExercise)[] = exercises.reduce((acc, exercise) => {
    const isAlreadyInAGroup = acc.find(g => Array.isArray(g) && g.find(e => e.id === exercise.id));
    if (isAlreadyInAGroup) {
      return acc;
    }

    const biSet = biSets.find(([a, b]) => a === exercise.id || b === exercise.id);
    if (biSet) {
      const [a, b] = biSet;
      if (a === exercise.id) {
        return [...acc, [exercise, exercises.find(e => e.id === b)!]];
      } else {
        return [...acc, [exercises.find(e => e.id === a)!, exercise]];
      }
    }

    return [...acc, exercise];
  }, [] as ([NewExercise, NewExercise] | NewExercise)[]);

  return (
    <div className="min-h-full bg-slate-100">
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
              <ProfilePic size="sm" user={profile.data.user} />
            )}
          </div>
        </div>
      </div>
      <div className="my-4 mx-2 flex">
        <div>
          <h1 className="text-slate-800">
            <span className="text-xl font-medium">Treino </span>
            <input
              type="text"
              placeholder="Nome do treino"
              className="rounded-md border-2 px-3 py-1 text-lg focus-visible:border-blue-600 focus-visible:outline-none"
              onChange={e => setName(e.target.value)}
            />
          </h1>
        </div>
      </div>
      <div>
        {categories.isLoading ? (
          <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
        ) : (
          groups.map(group => {
            if (Array.isArray(group)) {
              const [a, b] = group;

              return (
                <BiSetCard
                  key={a.id}
                  first={a}
                  second={b}
                  setBiSets={setBiSets}
                  setExercises={setExercises}
                  categories={categories.data}
                />
              );
            } else {
              const exercise = group;
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  setBiSets={setBiSets}
                  onEdit={it => setExercises(exercises.map(e => (e.id === exercise.id ? it : e)))}
                  onDelete={() => setExercises(exercises.filter(e => e.id !== exercise.id))}
                  categories={categories.data}
                  otherExercises={exercises.filter(({ id }) => id !== exercise.id)}
                />
              );
            }
          })
        )}
        <div className="flex flex-row items-center justify-center">
          <button
            className="flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-500 px-6 py-2 font-medium text-white hover:border-blue-600 hover:bg-blue-600"
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
          disabled={name === ""}
        >
          Salvar treino
          {name !== "" && <CheckCircleIcon className="h-8 w-8" />}
        </button>
      </div>
    </div>
  );
};

type ExerciseCardProps = {
  exercise: NewExercise;
  setBiSets?: Dispatch<SetStateAction<[number, number][]>>;
  onEdit: (exercise: NewExercise) => void;
  onDelete?: () => void;
  categories: { category: string; exercises: Exercise[] }[];
  otherExercises?: NewExercise[];
};

const ExerciseCard = ({
  exercise,
  setBiSets,
  onEdit,
  onDelete,
  categories,
  otherExercises,
}: ExerciseCardProps) => {
  const [type, setType] = useState<"reps" | "time">("reps");

  const [sets, setSets] = useState([{ reps: 0, weight: 0, time: 0 }]);

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
    setSets(newSets);

    if (type === "reps") {
      onEdit({ ...exercise, sets: newSets.map(set => ({ reps: set.reps, weight: set.weight })) });
    } else {
      onEdit({ ...exercise, sets: newSets.map(set => ({ time: set.time, weight: set.weight })) });
    }
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

  return (
    <div className="m-2 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 shadow-md">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <select
            className="text-md w-fit border-b-2 p-1 font-medium text-blue-600 focus:border-blue-600 focus-visible:outline-none"
            value={exercise.exerciseId}
            onChange={handleSelectExercise}
          >
            <option className="font-medium text-slate-600" value="" disabled>
              Selecione um exercício
            </option>
            {categories.map(group => (
              <optgroup
                label={group.category}
                key={group.category}
                className="my-2 block text-sm text-slate-700/70"
              >
                {group.exercises.map(e => (
                  <option key={e.id} className="font-medium text-blue-600" value={e.id}>
                    {e.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select className="text-md w-fit border-b-2 p-1 font-medium focus:border-blue-600 focus-visible:outline-none">
            {Object.values(Method).map(method => (
              <option key={method} value={method} className="text-sm font-medium">
                {methodTranslation[method]}
              </option>
            ))}
          </select>
          {onDelete && (
            <button
              className="ml-2 rounded-full p-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
              onClick={onDelete}
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        <textarea
          className="block w-full resize-none border-b-2 p-1 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          placeholder="Descrição"
          value={exercise.description ?? ""}
          onChange={e => onEdit({ ...exercise, description: e.target.value })}
          rows={exercise.description?.split("\n").length ?? 1}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex">
            <span className="mr-3 text-sm font-medium text-gray-900">Repetições</span>
            <label className="relative cursor-pointer items-center">
              <input
                type="checkbox"
                checked={type === "time"}
                onChange={e => updateType(e.target.checked ? "time" : "reps")}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
            </label>
            <span className="ml-3 text-sm font-medium text-gray-900">Tempo</span>
          </div>
          {otherExercises && (
            <label>
              <select
                className="w-fit border-b-2 p-1 text-sm font-medium focus:border-blue-600 focus-visible:outline-none"
                onChange={e => {
                  if (e.target.value === "") {
                    setBiSet(undefined);
                  } else {
                    setBiSet(Number(e.target.value));
                  }
                }}
              >
                <option className="text-sm text-slate-600" value={undefined}>
                  Selecione um exercício para bi-set
                </option>
                {otherExercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id} className="text-sm font-medium">
                    {
                      categories
                        .flatMap(group => group.exercises)
                        .find(e => e.id === exercise.exerciseId)?.name
                    }
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-col rounded-md px-2 py-1 font-medium shadow-md">
            <span className="text-slate-700">Séries</span>
            {sets.map((set, index) => (
              <div
                className="m-0.5 flex flex-row items-center gap-2 rounded bg-gray-100 p-0.5 shadow-md"
                key={index}
              >
                <input
                  type="number"
                  className="w-10 rounded-md border-2 text-center"
                  value={type === "reps" ? set.reps : set.time}
                  onChange={e => {
                    const newSets = [...sets];
                    newSets[index]![type === "reps" ? "reps" : "time"] = Number(e.target.value);
                    updateSets(newSets);
                  }}
                  min={0}
                />
                <span className="mr-2 text-slate-700">{type === "reps" ? "reps" : "seg"}</span>
                <input
                  type="number"
                  className="w-10 rounded-md border-2 text-center"
                  value={set.weight}
                  onChange={e => {
                    const newSets = [...sets];
                    newSets[index]!.weight = Number(e.target.value);
                    updateSets(newSets);
                  }}
                  min={0}
                />
                <span className="mr-2 text-slate-700">kg</span>
              </div>
            ))}
            <button
              className="m-0.5 flex flex-row items-center justify-center gap-2 rounded bg-gray-100 p-0.5 shadow-md"
              onClick={() => {
                const lastSet = sets.at(-1);
                if (lastSet) {
                  updateSets([...sets, { ...lastSet }]);
                } else {
                  updateSets([{ reps: 0, weight: 0, time: 0 }]);
                }
              }}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type BiSetCardProps = {
  first: NewExercise;
  second: NewExercise;
  setBiSets: Dispatch<SetStateAction<[number, number][]>>;
  setExercises: Dispatch<SetStateAction<NewExercise[]>>;
  categories: { category: string; exercises: Exercise[] }[];
};

const BiSetCard: React.FC<BiSetCardProps> = ({
  first,
  second,
  setBiSets,
  setExercises,
  categories,
}: BiSetCardProps) => {
  return (
    <div className="m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="flex flex-row items-center justify-between px-2">
        <span className="ml-4 font-medium text-gray-50">Bi-set</span>
        <button
          className="flex justify-center rounded-full bg-slate-50 p-1 text-blue-500 transition-colors hover:bg-slate-200 hover:text-blue-600"
          onClick={() => {
            setBiSets(biSets => biSets.filter(([a, b]) => a !== first.id && b !== second.id));
          }}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="m-2 mt-1 flex flex-col items-stretch">
        <ExerciseCard
          exercise={first}
          categories={categories}
          onEdit={it => setExercises(exercises => exercises.map(e => (e.id === first.id ? it : e)))}
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
