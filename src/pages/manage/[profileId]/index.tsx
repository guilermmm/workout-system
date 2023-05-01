import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import FullPage from "../../../components/FullPage";
import ProfilePic from "../../../components/ProfilePic";
import Spinner from "../../../components/Spinner";
import UserProfileButton from "../../../components/UserProfileButton";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import PencilSquareIcon from "../../../components/icons/PencilSquareIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { capitalize, classList, join } from "../../../utils";
import { api } from "../../../utils/api";

const Manage = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);
  const workouts = api.workout.getMany.useQuery({ profileId });

  const deleteWorkout = api.workout.delete.useMutation({
    onSuccess: () => void workouts.refetch(),
  });

  const changeStatus = profile.data?.isActive
    ? api.user.deactivate.useMutation()
    : api.user.activate.useMutation();

  if (profile.error || workouts.error) {
    return <ErrorPage />;
  }

  return (
    <FullPage>
      <div className="relative flex w-full flex-row items-start justify-between bg-slate-100 p-2">
        <div className="absolute left-0 top-0 right-0 h-20 bg-gold-500" />
        <Link
          href="/home"
          className="z-10 rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </Link>
        <div className="flex w-full flex-col items-center justify-center truncate pt-4">
          <div className="z-10 rounded-full bg-slate-100 p-2">
            <ProfilePic size="xl" user={profile.data?.user} />
          </div>
          <h1 className="mt-2 w-full self-start truncate text-center text-lg font-medium text-slate-900">
            {profile.data?.user && <span className="font-bold">{profile.data?.user.name}</span>}
          </h1>
        </div>
        <div className="h-6 w-6 p-5" />
      </div>
      <div className="mt-4">
        <div className="flex flex-col items-center justify-end px-4">
          <div className="flex pb-4">
            <div className="text-xl text-blue-700">Status: </div>
            <button
              onClick={() =>
                profile.data &&
                changeStatus.mutate(
                  { profileId: profile.data.id },
                  { onSuccess: () => void profile.refetch() },
                )
              }
              className={classList(
                "ml-2 rounded-full px-2 py-1 font-bold text-white",
                profile.data?.isActive ? "bg-green-500" : "bg-red-500",
              )}
            >
              {profile.data?.isActive ? "Ativo" : "Inativo"}
            </button>
          </div>

          <UserProfileButton
            title="Histórico de treinos"
            href={`/manage/${profileId}/workout_history`}
          />
          <UserProfileButton
            href={`/manage/${profileId}/datasheet_history`}
            title="Histórico de medidas"
          />
        </div>
      </div>
      {workouts.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="h-64 w-64 fill-blue-600 text-gray-200" />
        </div>
      ) : (
        <div className="mt-8 flex w-full flex-col items-center px-4">
          {workouts.data.map(workout => (
            <div
              className="m-2 flex w-full max-w-[32rem] flex-1 justify-between rounded-md bg-blue-500 p-6 text-white shadow-lg transition-colors hover:bg-blue-600"
              key={workout.id}
            >
              <div className="ml-5">
                <div className="text-xl">
                  Treino <span className="font-medium">{workout.name}</span>
                </div>
                <div className="text-sm font-thin opacity-90">
                  {capitalize(join(workout.categories))}
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Link
                  href={`/manage/${profileId}/edit_workout/${workout.id}`}
                  className="h-12 w-12 rounded-full p-3 text-gold-400 transition-colors hover:bg-white hover:text-gold-600"
                >
                  <PencilSquareIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => deleteWorkout.mutate({ id: workout.id })}
                  className="h-12 w-12 rounded-full p-3 text-red-400 transition-colors hover:bg-white hover:text-red-500"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed bottom-0 right-0 p-4">
        <Link href={`/manage/${profileId}/create_workout`}>
          <button className="flex w-full justify-center rounded-full border-2 border-white bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
            <PlusIcon className="h-10 w-10" />
          </button>
        </Link>
      </div>
    </FullPage>
  );
};

export default Manage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
