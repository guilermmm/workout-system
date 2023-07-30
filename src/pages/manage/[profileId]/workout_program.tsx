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

const WorkoutProgram = ({
  isSuperUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const { data, isLoading, isError } = api.workout.getWorkoutPrograms.useQuery({ profileId });

  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  if (isError) return <ErrorPage />;

  return (
    <FullPage>
      {selectedProgram && (
        <Modal
          buttons={
            <button
              onClick={() => setShowDeleteAlert(true)}
              className="rounded-md border-1 border-red-600 bg-red-600 py-2 px-4 text-white shadow-md"
            >
              Excluir
            </button>
          }
          onClickOutside={() => setSelectedProgram(null)}
        >
          <div>
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
                  <div className="w-full rounded-lg bg-blue-500 p-4 text-left text-white shadow-md hover:shadow-lg">
                    Treino {workout.name}
                  </div>
                </div>
              ))}
          </div>
        </Modal>
      )}
      {showDeleteAlert && (
        <Alert title="Excluir treino" icon={<ListBulletIcon className="fill-blue-500" />}>
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

export default WorkoutProgram;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
