import type { Datasheet, Exercise, ExerciseInWorkout } from "@prisma/client";

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

export type ParsedExercise = Omit<ExerciseInWorkout, "sets"> & { exercise: Exercise } & {
  sets: Sets;
};

export type ParsedDatasheet = Omit<Datasheet, "profileId" | "createdAt">;
