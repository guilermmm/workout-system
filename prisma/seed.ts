import { prisma } from "../src/server/db";

async function transformReps() {
  await prisma.$transaction(async tx => {
    const exercises = (await tx.exerciseInWorkout.findMany({
      select: {
        id: true,
        sets: true,
      },
    })) as {
      id: string;
      sets: {
        reps: number;
        weight: number;
      }[];
    }[];

    for (const exercise of exercises) {
      if (exercise.sets.length) {
        if ("reps" in exercise.sets[0]!) {
          await tx.exerciseInWorkout.update({
            where: { id: exercise.id },
            data: {
              sets: exercise.sets.map(set => ({
                reps: String(set.reps),
                weight: set.weight,
              })),
            },
          });
        }
      }
    }
  });
}

void transformReps();
