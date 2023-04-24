import type { Exercise } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "../../components/admin/Header";
import AdminNavbar from "../../components/admin/Navbar";
import ErrorPage from "../../components/ErrorPage";
import FullPage from "../../components/FullPage";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import PlusIcon from "../../components/icons/PlusIcon";
import TrashIcon from "../../components/icons/TrashIcon";
import Spinner from "../../components/Spinner";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";

import { z } from "zod";
import { useLocalStorage } from "../../utils";
import { api, type RouterOutputs } from "../../utils/api";

const organizeByParser = z.union([z.literal("name"), z.literal("category")]);

type Groups = RouterOutputs["exercise"]["getGroups"];

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const [newExercise, setNewExercise] = useState({ name: "", category: "" });

  const [organizeBy, setOrganizeBy] = useLocalStorage(
    "exercises-organize-by",
    organizeByParser,
    "category",
  );

  const groups = api.exercise.getGroups.useQuery();

  const filteredGroups = useMemo(
    () =>
      searchInput === ""
        ? groups.data
        : groups.data
            ?.map(group => {
              const searchLower = searchInput.toLowerCase();

              if (group.category.toLowerCase().includes(searchLower)) {
                return group;
              } else {
                const filteredExercises = group.exercises.filter(e =>
                  e.name.toLowerCase().includes(searchLower),
                );
                return { category: group.category, exercises: filteredExercises };
              }
            })
            .filter(g => g.exercises.length > 0),
    [groups, searchInput],
  );

  const filteredExercises = useMemo(
    () => filteredGroups?.flatMap(g => g.exercises) ?? groups.data?.flatMap(g => g.exercises),
    [filteredGroups, groups],
  );

  const addExercise = api.exercise.create.useMutation({
    onSuccess: () => {
      void groups.refetch();
      setNewExercise({ name: "", category: "" });
    },
  });

  const removeExercise = api.exercise.delete.useMutation({
    onSuccess: () => void groups.refetch(),
  });

  const handleRemoveExercise = (id: string) => () => {
    removeExercise.mutate({ id });
  };

  if (groups.error) {
    return <ErrorPage />;
  }

  return (
    <FullPage>
      <Header user={session?.user} />
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
        <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
          {groups.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <ExerciseList
              filteredExercises={filteredExercises}
              groups={groups.data}
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
              {groups.data?.map(group => (
                <option key={group.category} value={group.category} />
              ))}
            </datalist>
            <button
              onClick={() => addExercise.mutate(newExercise)}
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
  groups,
  organizeBy,
  handleRemoveExercise,
}: {
  filteredExercises: Exercise[] | undefined;
  groups: Groups;
  organizeBy: "name" | "category";
  handleRemoveExercise: (id: string) => () => void;
}) => {
  return (
    <div className="flex w-full max-w-[32rem] flex-col gap-1">
      {organizeBy === "category"
        ? groups?.map(category => (
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
      <div className="flex w-full flex-col justify-between truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
      <div className="flex items-center justify-center px-3">
        <button onClick={handleRemoveExercise(id)}>
          <TrashIcon className="h-6 w-6 text-red-500" />
        </button>
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
