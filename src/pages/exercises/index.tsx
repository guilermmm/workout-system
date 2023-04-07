import type { Exercise } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import AdminHeader from "../../components/AdminHeader";
import AdminNavbar from "../../components/AdminNavbar";
import ErrorPage from "../../components/ErrorPage";
import FullPage from "../../components/FullPage";
import Spinner from "../../components/Spinner";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";
import { reduceByCategory } from "../../utils";
import { api } from "../../utils/api";
import Link from "next/link";
import PlusIcon from "../../components/icons/PlusIcon";
import TrashIcon from "../../components/icons/TrashIcon";

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
  });

  const [organizeBy, setOrganizeBy] = useState<"name" | "category">("category");

  const exercises = api.exercise.getMany.useQuery();

  const filteredExercises = useMemo(
    () =>
      exercises.data
        ?.filter(exercise => {
          const name = exercise.name.toLowerCase();
          const category = exercise.category.toLowerCase();
          const searchLower = searchInput.toLowerCase();

          return name.includes(searchLower) || category.includes(searchLower);
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [exercises, searchInput],
  );

  const categories = useMemo(
    () => filteredExercises?.reduce(reduceByCategory, []),
    [filteredExercises],
  );

  const addExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      void exercises.refetch();
      setNewExercise({ name: "", category: "" });
    },
  });

  const removeExercise = api.exercise.delete.useMutation({
    onSuccess: () => void exercises.refetch(),
  });

  const handleRemoveExercise = (id: string) => () => {
    removeExercise.mutate({ id });
  };

  if (exercises.error) {
    return <ErrorPage />;
  }

  return (
    <FullPage>
      <AdminHeader user={session?.user} />
      <div className="m-2 flex items-center gap-2">
        <div className="relative grow">
          <input
            type="text"
            className="h-12 w-full rounded-full border-2 pl-4 pr-12"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
        </div>
        <div>
          <div className="inline-flex">
            <span className="mr-1 text-sm font-medium text-gray-900">Alfabética</span>
            <label className="relative cursor-pointer items-center">
              <input
                type="checkbox"
                checked={organizeBy === "category"}
                onChange={e => setOrganizeBy(e.target.checked ? "category" : "name")}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-blue-600 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
            </label>
            <span className="ml-1 text-sm font-medium text-gray-900">Categoria</span>
          </div>
        </div>
      </div>
      <div className="relative grow overflow-y-scroll">
        <div className="mx-4 flex h-full flex-1 grow flex-col gap-4">
          {exercises.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <ExerciseList
              filteredExercises={filteredExercises}
              categories={categories}
              organizeBy={organizeBy}
              handleRemoveExercise={handleRemoveExercise}
            />
          )}
          <div>
            <input
              type="text"
              placeholder="Nome"
              className="rounded-md px-1 text-center shadow-md"
              value={newExercise.name}
              onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
            />
            <input
              type="text"
              list="categories"
              placeholder="Categoria"
              className="rounded-md text-center shadow-md"
              value={newExercise.category}
              onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
            />
            <datalist id="categories">
              {categories?.map(category => (
                <option key={category.category} value={category.category} />
              ))}
            </datalist>
            <button
              onClick={() =>
                addExercise.mutate({ name: newExercise.name, category: newExercise.category })
              }
              className="rounded-md bg-blue-500 px-3 py-1 text-white shadow-md"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
      <AdminNavbar />
    </FullPage>
  );
};

const ExerciseList = ({
  filteredExercises,
  categories,
  organizeBy,
  handleRemoveExercise,
}: {
  filteredExercises: Exercise[] | undefined;
  categories:
    | {
        category: string;
        exercises: Exercise[];
      }[]
    | undefined;
  organizeBy: "name" | "category";
  handleRemoveExercise: (id: string) => () => void;
}) => {
  return (
    <div className="flex flex-col flex-wrap items-stretch gap-1 sm:flex-row">
      {organizeBy === "category"
        ? categories?.map(category => (
            <CategoryCard
              {...category}
              key={category.category}
              handleRemoveExercise={handleRemoveExercise}
            />
          ))
        : filteredExercises?.map(exercise => (
            <ExerciseCard
              {...exercise}
              key={exercise.id}
              showCategory
              handleRemoveExercise={handleRemoveExercise}
            />
          ))}
    </div>
  );
};

const ExerciseCard = ({
  id,
  name,
  category,
  showCategory = false,
  handleRemoveExercise,
}: {
  id: string;
  name: string;
  category: string;
  showCategory?: boolean;
  handleRemoveExercise: (id: string) => () => void;
}) => {
  return (
    <div className="flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-blue-500">
      <div className="flex w-full justify-between truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        <button onClick={handleRemoveExercise(id)}>
          <TrashIcon className="h-6 w-6 text-red-500" />
        </button>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
    </div>
  );
};

const CategoryCard = ({
  category,
  exercises,
  handleRemoveExercise,
}: {
  category: string;
  exercises: Exercise[];
  handleRemoveExercise: (id: string) => () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col" key={category}>
      <div className="w-min">
        <div className="text-lg font-medium text-slate-800">{category}</div>
        <div className="mb-2 h-1 w-full bg-gold-500" />
      </div>
      <div className="flex flex-col gap-1">
        {exercises.map(exercise => (
          <ExerciseCard
            {...exercise}
            key={exercise.id}
            handleRemoveExercise={handleRemoveExercise}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
