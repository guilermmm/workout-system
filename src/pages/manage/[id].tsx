import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { capitalize, join } from "../../utils";
import { api } from "../../utils/api";

const Manage = () => {
  const router = useRouter();

  const instructor = api.app.getUser.useQuery();

  if (instructor.data?.isInstructor === false) {
    void router.push("/");
  }

  const { id } = router.query as { id: string };

  const workouts = api.workout.getWorkouts.useQuery({ userId: id });

  const user = api.app.getUserById.useQuery(id);

  return workouts.data == null ? (
    <div className="min-h-full bg-slate-100">
      <div className="text-xl">carregano carai</div>
    </div>
  ) : (
    <div className="min-h-full bg-slate-100">
      <div className="flex flex-row items-center justify-between bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
        {user.data && (
          <div className="flex flex-row items-center justify-between text-right">
            <div className="ml-4 flex flex-col">
              <h1 className="text-xl text-blue-700">
                Treinos ativos de <span className="font-bold">{user.data.name}</span>
              </h1>
              <p className="font-medium text-slate-700">{user.data.email}</p>
            </div>
            <Image
              src={user.data.image ?? ""}
              alt={`Foto de perfil de ${user.data.name!}`}
              width={48}
              height={48}
              className="ml-4 rounded-full"
            />
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col flex-wrap items-stretch sm:flex-row">
        {workouts.data.map(workout => (
          <WorkoutCard
            onDelete={() => {
              void workouts.refetch();
            }}
            key={workout.id}
            id={workout.id}
            name={workout.name}
            description={capitalize(join(Array.from(new Set(workout.muscleGroups))))}
          />
        ))}
      </div>
      <div className="fixed bottom-0 right-0 p-4">
        <button className="flex w-full justify-center rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-10 w-10"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
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
  const deleteWorkout = api.workout.deleteWorkout.useMutation({
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
        </Link>
        <button
          onClick={() => {
            deleteWorkout.mutate({ id });
          }}
          className="h-12 w-12 rounded-full p-3 text-red-400 transition-colors hover:bg-white hover:text-red-500"
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Manage;
