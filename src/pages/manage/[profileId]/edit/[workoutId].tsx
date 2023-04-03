import type { Exercise, ExerciseInWorkout } from "@prisma/client";
import deepEqual from "deep-equal";
import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorPage from "../../../../components/ErrorPage";
import Spinner from "../../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../../components/icons/ArrowUturnLeftIcon";
import CheckCircleIcon from "../../../../components/icons/CheckCircleIcon";
import PlusIcon from "../../../../components/icons/PlusIcon";
import TrashIcon from "../../../../components/icons/TrashIcon";
import { env } from "../../../../env/server.mjs";
import { getServerAuthSession } from "../../../../server/auth";
import { api } from "../../../../utils/api";
import type { ParseJsonValues } from "../../../../utils/types";

const EditWorkout = () => {
  const router = useRouter();

  const { profileId, workoutId } = router.query as { profileId: string; workoutId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const categories = api.exercise.getGroups.useQuery();

  const workout = api.workout.getById.useQuery(workoutId, {
    onSuccess: data => {
      if (data) {
        router.back();
      }
    },
    refetchOnWindowFocus: false,
  });

  const { mutate } = api.workout.update.useMutation({ onSuccess: () => workout.refetch() });

  const [editedExercises, setEditedExercises] = useState<
    NonNullable<typeof workout.data>["exercises"]
  >([]);

  const [remove, setRemove] = useState<string[]>([]);

  const [biSets, setBiSets] = useState<[number, number][]>([]);

  const [name, setName] = useState("");

  const changes =
    !deepEqual(workout.data?.exercises, editedExercises) &&
    editedExercises.every(exercise => exercise.exercise.id !== "");

  if (profile.error || categories.error || workout.error) {
    return <ErrorPage />;
  }

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
        {workout.data && (
          <div className="flex flex-row items-center justify-between text-right">
            <div className="ml-4 flex flex-col">
              <h1 className=" text-xl text-blue-700">
                <span className="font-bold">
                  {workout.data.profile.user?.name!.split(" ").at(0)}
                </span>
              </h1>
              <p className=" font-medium text-slate-700">
                {workout.data.profile.email.split("@").at(0)}@...
              </p>
            </div>
            <Image
              src={workout.data.profile.user?.image ?? ""}
              alt={`Foto de perfil de ${
                workout.data.profile.user?.name ?? workout.data.profile.email
              }`}
              width={48}
              height={48}
              className="ml-4 block rounded-full"
            />
          </div>
        )}
      </div>
      <div className="my-4 mx-2 flex">
        <div>
          <h1 className="text-xl font-medium text-slate-800">
            <span className="text-xl font-medium">Treino </span>
            <input
              type="text"
              placeholder="Nome do treino"
              className="rounded-md border-2 px-3 py-1 text-lg focus-visible:border-blue-600 focus-visible:outline-none"
              onChange={e => setName(e.target.value)}
            />
          </h1>
          <div className={"h-1 bg-gold-500"} />
        </div>
        {/* {editingName ? (
          <button
            onClick={() => {
              if (workoutName !== "" && workoutName !== workout.data!.name)
                changeName.mutate({ id: workout.data!.id, name: workoutName });

              setEditingName(false);
            }}
            className="ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.25}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        ) : (
          <button
            className="ml-2"
            onClick={() => {
              setEditingName(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        )} */}
      </div>
      <div>
        {categories.isLoading ? (
          <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
        ) : (
          editedExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={editedExercise => {
                setEditedExercises(
                  editedExercises.map(e => (e.id === exercise.id ? editedExercise : e)),
                );
              }}
              onDelete={id => {
                setEditedExercises(editedExercises.filter(e => e.id !== id));
                setRemove([...remove, id]);
              }}
              categories={categories.data}
            />
          ))
        )}
        <div className="flex flex-row items-center justify-center">
          <button
            className="flex items-center gap-3 rounded-full border-2 border-blue-200 bg-blue-500 px-6 py-2 font-medium text-white hover:border-blue-600 hover:bg-blue-600"
            onClick={() => {
              // setEditedExercises([
              //   ...editedExercises,
              //   {
              //     id: cuid(),
              //     workoutId: id,
              //     description: "",
              //     exerciseId: "",
              //     exercise: {
              //       id: "",
              //       name: "",
              //       category: "",
              //     },
              //   },
              // ]);
            }}
          >
            Adicionar exercício
            <PlusIcon className="h-8 w-8" />
          </button>
        </div>
      </div>
      {changes ||
        (true && (
          <div className="fixed bottom-0 right-0 p-4">
            <button
              className="flex items-center gap-3 rounded-full border-2 border-green-200 bg-green-500 px-6 py-2 font-medium text-white hover:border-green-600 hover:bg-green-600"
              // onClick={() => {
              //   const exercises = editedExercises.map(e => {
              //     if (e.id.length == 10) {
              //       e.id = "";
              //     }
              //     return e;
              //   });

              //   saveWorkout.mutate({
              //     id,
              //     name: workout.data.name,
              //     exercises: {
              //       create: [],
              //       update: [],
              //       delete: []
              //     }
              //   });
              // }}
            >
              Salvar alterações
              <CheckCircleIcon className="h-8 w-8" />
            </button>
          </div>
        ))}
    </div>
  );
};

type ExerciseCardProps = {
  exercise: ParseJsonValues<ExerciseInWorkout & { exercise: Exercise }>;
  onEdit: (exercise: ParseJsonValues<ExerciseInWorkout & { exercise: Exercise }>) => void;
  onDelete: (id: string) => void;
  categories: { category: string; exercises: Exercise[] }[];
};

const ExerciseCard = ({ exercise, onEdit, onDelete, categories }: ExerciseCardProps) => {
  return (
    <div
      className="m-2 flex justify-between gap-4 rounded-lg bg-white p-4 shadow-md"
      key={exercise.exercise.id}
    >
      <div className="flex flex-1 flex-col gap-2">
        <select
          className="text-md w-fit border-b-2 p-1 font-medium text-blue-600 focus:border-blue-600 focus-visible:outline-none"
          value={exercise.id}
          // onChange={e => {
          //   const newExercise = exerciseCategories
          //     .flatMap(group => group.exercises)
          //     .find(exercise => exercise.id === e.target.value);

          //   if (newExercise) {
          //     onEdit({ ...exercise, exercise: newExercise, exerciseId: newExercise.id });
          //   }
          // }}
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
        <textarea
          className="block w-full resize-none border-b-2 p-1 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          placeholder="Descrição"
          value={exercise.description ?? ""}
          onChange={e => onEdit({ ...exercise, description: e.target.value })}
          rows={exercise.description?.split("\n").length ?? 1}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 text-sm">
          <label className="rounded-md px-2 py-1 font-medium shadow-md">
            {/* <input
              type="number"
              className="w-10 rounded-md border-2 text-center"
              value={exercise.sets}
              onChange={e => onEdit({ ...exercise, sets: Number(e.target.value) })}
              min={0}
            /> */}
            <span className="ml-2 text-slate-700">séries</span>
          </label>
          {/* {exercise.exercise.hasReps ? (
            <label className="rounded-md px-2 py-1 font-medium shadow-md">
              <input
                type="number"
                className="w-10 rounded-md border-2 text-center"
                value={exercise.reps}
                onChange={e => onEdit({ ...exercise, reps: Number(e.target.value) })}
                min={0}
              />
              <span className="ml-2 text-slate-700">repetições</span>
            </label>
          ) : (
            <label className="rounded-md px-2 py-1 font-medium shadow-md">
              <input
                type="number"
                className="w-10 rounded-md border-2 text-center"
                value={exercise.time}
                onChange={e => onEdit({ ...exercise, time: Number(e.target.value) })}
                min={0}
              />
              <span className="ml-2 text-slate-700">segundos</span>
            </label>
          )} */}
        </div>
        <button
          className="ml-2 rounded-full p-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
          onClick={() => onDelete(exercise.id)}
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default EditWorkout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}