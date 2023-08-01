import { prisma } from "../src/server/db";

async function transformWeights() {
  await prisma.$transaction(
    async tx => {
      const exercises = (await tx.exerciseInWorkout.findMany({
        select: {
          id: true,
          sets: true,
        },
      })) as {
        id: string;
        sets: (
          | {
              reps: string;
              weight: string | number;
            }
          | {
              time: number;
              weight: string | number;
            }
        )[];
      }[];

      for (const exercise of exercises) {
        if (exercise.sets.length) {
          await tx.exerciseInWorkout.update({
            where: { id: exercise.id },
            data: {
              sets: exercise.sets.map(set => {
                const weight =
                  typeof set.weight === "string"
                    ? set.weight
                    : set.weight === 0
                    ? ""
                    : `${set.weight / 1000} kg`;

                if ("reps" in set) {
                  return { reps: set.reps, weight };
                } else {
                  return { time: set.time, weight };
                }
              }),
            },
          });
        }
      }
    },
    {
      timeout: 20000,
    },
  );
}

void transformWeights();
