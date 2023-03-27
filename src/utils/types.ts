import type { Datasheet, Exercise, ExerciseInWorkout } from "@prisma/client";
import type { Simplify } from "@trpc/server";

export type Sets = RepSet[] | TimeSet[];

export type RepSet = {
  reps: number;
  weight: number;
};

export type TimeSet = {
  time: number;
  weight: number;
};

export type BiSets = [string, string][];

export type ParsedExercise = Simplify<
  Omit<ExerciseInWorkout, "sets"> & { sets: Sets } & {
    exercise: Exercise;
  }
>;

export type ParsedDatasheet = Omit<Datasheet, "profileId" | "createdAt">;
