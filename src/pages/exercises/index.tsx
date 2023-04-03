import type { Exercise } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import ErrorPage from "../../components/ErrorPage";
import ProfilePic from "../../components/ProfilePic";
import Spinner from "../../components/Spinner";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import MagnifyingGlassIcon from "../../components/icons/MagnifyingGlassIcon";
import { env } from "../../env/server.mjs";
import { getServerAuthSession } from "../../server/auth";
import { reduceByCategory } from "../../utils";
import { api } from "../../utils/api";

const Dashboard = () => {
  const { data: session } = useSession();

  const [searchInput, setSearchInput] = useState("");

  const exercises = api.exercise.getMany.useQuery();

  const [organizeBy, setOrganizeBy] = useState<"name" | "category">("category");

  if (exercises.error) {
    return <ErrorPage />;
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <ProfilePic user={session?.user} size="sm" />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{session?.user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => void signOut()}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        <div className="mx-4 flex h-full flex-1 grow flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative my-2 grow">
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
          {exercises.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="fill-blue-600 text-gray-200" />
            </div>
          ) : (
            <ExerciseList exercises={exercises.data} search={searchInput} organizeBy={organizeBy} />
          )}
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
};

const ExerciseList = ({
  exercises,
  search,
  organizeBy,
}: {
  exercises: Exercise[];
  search: string;
  organizeBy: "name" | "category";
}) => {
  const filteredExercises = useMemo(
    () =>
      exercises
        .filter(exercise => {
          const name = exercise.name.toLowerCase();
          const category = exercise.category.toLowerCase();
          const searchLower = search.toLowerCase();

          return name.includes(searchLower) || category.includes(searchLower);
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [exercises, search],
  );

  const categories = useMemo(
    () => filteredExercises.reduce(reduceByCategory, []),
    [filteredExercises],
  );

  return (
    <div className="flex flex-col flex-wrap items-stretch gap-1 sm:flex-row">
      {organizeBy === "category"
        ? categories.map(category => <CategoryCard {...category} key={category.category} />)
        : filteredExercises.map(exercise => (
            <ExerciseCard {...exercise} key={exercise.id} showCategory />
          ))}
    </div>
  );
};

const ExerciseCard = ({
  name,
  category,
  showCategory = false,
}: {
  name: string;
  category: string;
  showCategory?: boolean;
}) => {
  return (
    <div className="flex max-w-[calc(100vw_-_2rem)] flex-1 flex-row items-center justify-between rounded-md bg-blue-500">
      <div className="truncate px-3 py-2">
        <div className="text-md truncate text-white">{name}</div>
        {showCategory && <div className="truncate text-sm text-slate-100">{category}</div>}
      </div>
    </div>
  );
};

const CategoryCard = ({ category, exercises }: { category: string; exercises: Exercise[] }) => {
  return (
    <div className="flex flex-1 flex-col" key={category}>
      <div className="w-min">
        <div className="text-lg font-medium text-slate-800">{category}</div>
        <div className="mb-2 h-1 w-full bg-gold-500" />
      </div>
      <div className="flex flex-col gap-1">
        {exercises.map(exercise => (
          <ExerciseCard {...exercise} key={exercise.id} />
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
