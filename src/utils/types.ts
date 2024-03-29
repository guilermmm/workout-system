import type { Datasheet, Method, Prisma } from "@prisma/client";
import type { Simplify } from "@trpc/server";

export type Sets = RepSet[] | TimeSet[];

export type RepSet = {
  reps: string;
  weight: string;
};

export type TimeSet = {
  time: number;
  weight: string;
};

export type BiSets = [string, string][];

export type FinishedExerciseSets = (
  | { reps: string; weight: string; completed: boolean }
  | { time: number; weight: string; completed: boolean }
)[];

export type FinishedExercise = {
  exercise: {
    id: string;
    name: string;
    category: string;
  };
  description: string | null;
  method: Method;
  sets: FinishedExerciseSets;
};

export type FinishedExerciseGroup = { exercises: [FinishedExercise, FinishedExercise] };

export type FinishedGroup = FinishedExercise | FinishedExerciseGroup;

export type ParseSets<T> = T extends { sets: Prisma.JsonValue }
  ? Simplify<Omit<T, "sets"> & { sets: Sets }>
  : T extends Array<infer U>
  ? Array<ParseSets<U>>
  : T extends Date
  ? T
  : T extends object
  ? { [K in keyof T]: ParseSets<T[K]> }
  : T;

export type ParseBiSets<T> = T extends { biSets: Prisma.JsonValue }
  ? Simplify<Omit<T, "biSets"> & { biSets: BiSets }>
  : T extends Array<infer U>
  ? Array<ParseBiSets<U>>
  : T extends Date
  ? T
  : T extends object
  ? { [K in keyof T]: ParseBiSets<T[K]> }
  : T;

export type ParseJsonValues<T> = Simplify<ParseBiSets<ParseSets<T>>>;

export type ParsedDatasheet = Omit<Datasheet, "createdAt">;

export type ParseFinishedWorkout<T extends { exercises: Prisma.JsonValue }> = Simplify<
  Omit<T, "exercises"> & { exercises: FinishedGroup[] }
>;

export type ParseWorkoutProgram<T extends { workouts: Prisma.JsonValue }> = Simplify<
  Omit<T, "workouts"> & {
    workouts: {
      id: string;
      name: string;
      days: string[];
      exercises: {
        id: string;
        exercise: {
          name: string;
          category: string;
        };
        sets: Sets;
        method: Method;
        description: string | null;
      }[];
      biSets: BiSets;
    }[];
  }
>;
