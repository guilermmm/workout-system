import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import ProfilePic from "../../../components/ProfilePic";
import Spinner from "../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import PencilSquareIcon from "../../../components/icons/PencilSquareIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { capitalize, join } from "../../../utils";
import { api } from "../../../utils/api";
import UserProfileButton from "../../../components/UserProfileButton";

const Manage = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);
  const workouts = api.workout.getMany.useQuery({ profileId });

  if (profile.error || workouts.error) {
    return <ErrorPage />;
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <div className="flex flex-row items-center justify-between bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <div className="flex max-w-[calc(100vw_-_144px)] flex-row items-center justify-between text-right">
            <div className="ml-4 flex flex-col truncate">
              {profile.data && (
                <>
                  <h1 className="truncate text-xl font-bold text-blue-700">
                    {profile.data.user?.name}
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
      <div className="mt-4">
        <UserProfileButton
          title="Histórico de treinos"
          href={`/manage/${profileId}/workout_history`}
        />
        <UserProfileButton
          title="Histórico de medidas"
          href={`/manage/${profileId}/datasheet_history`}
        />
        <UserProfileButton
          title="Atualizar medidas"
          href={`/manage/${profileId}/update_datasheet`}
        />
      </div>
      {workouts.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="h-64 w-64 fill-blue-600 text-gray-200" />
        </div>
      ) : (
        <div className="mt-8 flex flex-col flex-wrap items-stretch sm:flex-row">
          {workouts.data.map(workout => (
            <WorkoutCard
              onDelete={() => void workouts.refetch()}
              key={workout.id}
              id={workout.id}
              name={workout.name}
              description={capitalize(join(workout.categories))}
            />
          ))}
        </div>
      )}
      <div className="fixed bottom-0 right-0 p-4">
        <Link href={`/manage/${profileId}/create_workout`}>
          <button className="flex w-full justify-center rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
            <PlusIcon className="h-10 w-10" />
          </button>
        </Link>
      </div>
    </div>
  );
};

type WorkoutCardProps = {
  id: string;
  name: string;
  description: string;
  onDelete: () => void;
};

const WorkoutCard = ({ id, name, description, onDelete }: WorkoutCardProps) => {
  const deleteWorkout = api.workout.delete.useMutation({
    onSuccess: () => {
      onDelete();
    },
  });

  return (
    <div className="m-2 flex min-w-fit flex-1 justify-between rounded-md bg-blue-500 p-6 text-white shadow-lg transition-colors hover:bg-blue-600">
      <div className="ml-5">
        <div className="text-xl">
          Treino <span className="font-medium">{name}</span>
        </div>
        <div className="text-sm font-thin opacity-90">{description}</div>
      </div>
      <div className="flex justify-center gap-2">
        <Link
          href={`/manage/edit/${id}`}
          className="h-12 w-12 rounded-full p-3 text-gold-400 transition-colors hover:bg-white hover:text-gold-600"
        >
          <PencilSquareIcon className="h-6 w-6" />
        </Link>
        <button
          onClick={() => {
            deleteWorkout.mutate({ id });
          }}
          className="h-12 w-12 rounded-full p-3 text-red-400 transition-colors hover:bg-white hover:text-red-500"
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
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
