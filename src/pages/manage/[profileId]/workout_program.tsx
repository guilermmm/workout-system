import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import AdminNavbar from "../../../components/admin/Navbar";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import FullPage from "../../../components/FullPage";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import Spinner from "../../../components/Spinner";
import { useState } from "react";
import Modal from "../../../components/Modal";
import Alert from "../../../components/Alert";
import ListBulletIcon from "../../../components/icons/ListBulletIcon";
import InformationIcon from "../../../components/icons/InformationIcon";
import { methodExplanation, methodTranslation } from "../../../utils/consts";
import { FinishedExercise, Sets } from "../../../utils/types";
import { Method } from "@prisma/client";
import { classList } from "../../../utils";

const WorkoutProgram = ({
  isSuperUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const { data, isLoading, isError, refetch } = api.workout.getWorkoutPrograms.useQuery({
    profileId,
  });

  const deleteProgram = api.workout.deleteWorkoutProgram.useMutation({
    onSuccess: () => {
      setShowDeleteAlert(false);
      setSelectedProgram(null);
      void refetch();
    },
  });

  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  if (isError) return <ErrorPage />;

  return (
    <FullPage>
      {selectedProgram && (
        <Modal
          buttons={
            <div className="flex gap-2">
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => {
                  setSelectedProgram(null);
                  setSelectedWorkout(null);
                }}
              >
                Fechar
              </button>
              <button
                onClick={() => setShowDeleteAlert(true)}
                className="rounded-md border-1 border-red-600 bg-red-600 py-2 px-4 text-white shadow-md"
              >
                Excluir
              </button>
            </div>
          }
          onClickOutside={() => setSelectedProgram(null)}
        >
          {selectedWorkout ? (
            <div className="flex max-h-full w-full max-w-xl flex-col gap-4 rounded-md bg-slate-50">
              <div className="ml-2 flex justify-between gap-2 text-center font-medium">
                <h2 className="font-medium">
                  Treino{" "}
                  <b>
                    {
                      data
                        ?.find(d => d.id === selectedProgram)
                        ?.workouts.find(w => w.id === selectedWorkout)?.name
                    }
                  </b>
                </h2>
              </div>
              <div className="flex w-full grow flex-col items-center overflow-y-auto">
                <div className="flex w-full flex-col gap-2">
                  {data
                    ?.find(d => d.id === selectedProgram)
                    ?.workouts.map((group, i) => {
                      if ("exercises" in group) {
                        const [first, second] = group.exercises;
                        return (
                          <div key={i} className="m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
                            <div className="flex flex-col">
                              <div className="">
                                <span className="p-3 font-medium text-gray-50">Bi-set</span>
                              </div>
                              <div className="flex flex-col items-stretch">
                                <ExerciseCard exercise={first} />
                                <ExerciseCard exercise={second} />
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return <ExerciseCard key={i} exercise={group} />;
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="px-4 pb-2">
                {`Treinos registrados em ${
                  data
                    ?.find(workoutProgram => workoutProgram.id === selectedProgram)
                    ?.createdAt.toLocaleDateString("pt-BR") ?? ""
                }`}
              </div>
              <div className="flex flex-col gap-2">
                {data
                  ?.find(workoutProgram => workoutProgram.id === selectedProgram)
                  ?.workouts.map(workout => (
                    <div key={workout.id} className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedWorkout(workout.id)}
                        className="w-full rounded-lg bg-blue-500 p-4 text-left text-white shadow-md hover:shadow-lg"
                      >
                        Treino {workout.name}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Modal>
      )}
      {showDeleteAlert && (
        <Alert
          onClickOutside={() => setShowDeleteAlert(false)}
          title="Excluir treino"
          footer={
            <>
              <button
                onClick={() =>
                  deleteProgram.mutate({ id: data?.find(d => d.id === selectedProgram)?.id ?? "" })
                }
                className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteProgram.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-white text-gray-200" />
                  </div>
                ) : (
                  "Excluir"
                )}
              </button>
              {!deleteProgram.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowDeleteAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          icon={<ListBulletIcon className="fill-blue-500" />}
        >
          <div>Tem certeza que deseja excluir o treino arquivado?</div>
        </Alert>
      )}

      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium text-blue-700">
          <span className="font-bold">Treinos arquivados</span>
        </h1>
      </div>

      <div className="flex grow flex-col items-center overflow-y-auto">
        <div className="mt-6 flex w-full max-w-[40rem] grow flex-col gap-2 p-2">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            data?.map(workoutProgram => (
              <button
                key={workoutProgram.id}
                onClick={() => setSelectedProgram(workoutProgram.id)}
                className="w-full rounded-lg bg-blue-500 p-4 text-left text-white shadow-md hover:shadow-lg"
              >
                <div>{workoutProgram.createdAt.toLocaleDateString("pt-BR")}</div>
              </button>
            ))
          )}
        </div>
      </div>
      <AdminNavbar isSuperUser={isSuperUser} />
    </FullPage>
  );
};

const ExerciseCard = ({
  exercise,
}: {
  exercise: {
    id: string;
    exercise: {
      name: string;
      category: string;
    };
    sets: Sets;
    method: Method;
    description: string | null;
  };
}) => {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white pt-2 shadow-md">
      {showAlert && (
        <Alert
          icon={
            <InformationIcon className="h-10 w-10 rounded-full bg-blue-200 p-2 text-blue-600" />
          }
          title={methodTranslation[exercise.method]}
          footer={
            <>
              <button
                className="rounded-md bg-gold-400 py-2 px-4 font-medium shadow-md"
                onClick={() => setShowAlert(false)}
              >
                Entendi
              </button>
            </>
          }
          onClickOutside={() => setShowAlert(false)}
        >
          {methodExplanation[exercise.method]}
        </Alert>
      )}
      <div className="absolute left-4 top-2 text-sm">
        <span className="font-medium text-blue-600">{exercise.exercise.name}</span>
      </div>
      <div className={classList("flex flex-col transition-all duration-200")}>
        <div className="flex flex-col px-4">
          <div className="flex h-10 flex-row items-center justify-between">
            <div className="flex flex-none flex-row flex-wrap items-center">
              <div className="flex flex-col">
                <div className="opacity-0">{exercise.exercise.name}</div>
                <div className="text-xs text-slate-600">{exercise.exercise.category}</div>
              </div>
            </div>
            {exercise.method !== "Standard" && (
              <div className="shrink text-xs">
                <button className="flex items-center gap-1" onClick={() => setShowAlert(true)}>
                  <span className="text-right">{methodTranslation[exercise.method]}</span>
                  <InformationIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        {exercise.description && (
          <div className="mx-2 mb-2 rounded-md border-1 p-2 text-sm text-slate-800 shadow-inner">
            {exercise.description}
          </div>
        )}
        <div className="mt-2 flex flex-col text-sm text-slate-800">
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className="mx-2 mb-2 flex items-center justify-between gap-4 rounded-md border-1 p-1.5 px-5 shadow-md"
            >
              <div className="font-medium">{i + 1}.</div>
              <div className="flex items-center gap-1">
                <span>Peso: </span>
                <span className="font-medium">{set.weight / 1000}kg</span>
              </div>
              {"time" in set ? (
                <div>
                  <span>Tempo: </span>
                  <span className="font-medium">
                    {set.time > 60 && `${Math.floor(set.time / 60)}min`}
                  </span>
                  <span className="font-medium">{set.time % 60 > 0 && ` ${set.time % 60}s`}</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">{set.reps}</span>
                  <span> {set.reps !== "1" ? "repetições" : "repetição"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgram;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
