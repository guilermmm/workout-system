import type { Profile } from "@prisma/client";
import Link from "next/link";
import { capitalize, classList, join } from "../utils";
import { api } from "../utils/api";

const WorkoutsTab = ({ profile }: { profile: Profile }) => {
  const [workouts] = api.workout.getWorkouts.useSuspenseQuery({ profileId: profile.id ?? "" });

  return (
    <>
      {workouts.map(workout => (
        <WorkoutCard
          key={workout.id}
          id={workout.id}
          name={workout.name}
          description={capitalize(join(workout.categories))}
          recommended={profile.nextWorkoutId === workout.id}
        />
      ))}
    </>
  );
};

export default WorkoutsTab;

type WorkoutCardProps = {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
};

const WorkoutCard = ({ id, name, description, recommended = false }: WorkoutCardProps) => {
  return (
    <Link
      href={`/workout/${id}`}
      className="m-2 flex min-w-fit flex-1 flex-col justify-center rounded-md bg-blue-500 p-6 pt-4 pl-3 text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div>
        {recommended && (
          <div className="flex text-sm font-medium text-gold-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-1 inline h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                clipRule="evenodd"
              />
            </svg>
            <span>Recomendado</span>
          </div>
        )}
        <div className={classList("pl-6", { "pt-2": !recommended })}>
          <div className="text-xl">
            Treino <span className="font-medium">{name}</span>
          </div>
          <div className="text-sm font-thin opacity-90">{description}</div>
        </div>
      </div>
    </Link>
  );
};
