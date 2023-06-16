import { Method, Weekday } from "@prisma/client";
import type { Reducer } from "react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { z } from "zod";
import { weekdaysOrder } from "./consts";

const idParser = z.union([z.number(), z.string()]);

export type Id = z.infer<typeof idParser>;

export const setParser = z.object({
  reps: z.number().min(0),
  weight: z.number().min(0),
  time: z.object({
    minutes: z.number().min(0),
    seconds: z.number().min(0).max(59),
  }),
});

export type Set = z.infer<typeof setParser>;

export const exerciseParser = z.object({
  id: idParser,
  exerciseId: z.string(),
  description: z.string(),
  method: z.nativeEnum(Method),
  type: z.union([z.literal("REPS"), z.literal("TIME")]),
  sets: z.array(setParser),
  hidden: z.boolean(),
});

export type Exercise = z.infer<typeof exerciseParser>;

export const workoutParser = z.object({
  name: z.string(),
  days: z.array(z.nativeEnum(Weekday)),
  exercises: z.array(exerciseParser),
  biSets: z.array(z.tuple([idParser, idParser])),
});

export type Workout = z.infer<typeof workoutParser>;

type ExerciseGroup = {
  id: Id;
  exercises: readonly [Exercise, Exercise];
};

type WorkoutAction =
  | ["SET_WORKOUT", Workout]
  | ["SET_NAME", string]
  | ["SET_DAYS", Weekday[]]
  | ["SET_EXERCISES", Exercise[]]
  | ["ADD_EXERCISE", Id]
  | ["REMOVE_EXERCISE", Id]
  | ["SET_EXERCISE_ID", [Id, string]]
  | ["SET_EXERCISE_DESCRIPTION", [Id, string]]
  | ["SET_EXERCISE_METHOD", [Id, Method]]
  | ["SET_EXERCISE_TYPE", [Id, "REPS" | "TIME"]]
  | ["SET_EXERCISE_HIDDEN", [Id, boolean]]
  | ["ADD_SET", Id]
  | ["REMOVE_SET", [Id, number]]
  | ["SET_SET_REPS", [Id, number, number]]
  | ["SET_SET_WEIGHT", [Id, number, number]]
  | ["SET_SET_TIME", [Id, number, { minutes: number; seconds: number }]]
  | ["CREATE_BISET", [Id, Id]]
  | ["DESTROY_BISET", Id]
  | ["SET_BISET_HIDDEN", [Id, boolean]];

const workoutReducer: Reducer<Workout, WorkoutAction> = (workout, [type, payload]) => {
  switch (type) {
    case "SET_WORKOUT": {
      return payload;
    }
    case "SET_NAME": {
      return { ...workout, name: payload };
    }
    case "SET_DAYS": {
      return { ...workout, days: payload.sort((a, b) => weekdaysOrder[a] - weekdaysOrder[b]) };
    }
    case "SET_EXERCISES": {
      return { ...workout, exercises: payload };
    }
    case "ADD_EXERCISE": {
      const newExercise: Exercise = {
        id: payload,
        exerciseId: "",
        description: "",
        method: Method.Standard,
        type: "REPS",
        sets: [{ reps: 0, weight: 0, time: { minutes: 0, seconds: 0 } }],
        hidden: false,
      };
      return { ...workout, exercises: [...workout.exercises, newExercise] };
    }
    case "REMOVE_EXERCISE": {
      return {
        ...workout,
        exercises: workout.exercises.filter(exercise => exercise.id !== payload),
      };
    }
    case "SET_EXERCISE_ID": {
      const [id, exerciseId] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return { ...exercise, exerciseId };
          }
          return exercise;
        }),
      };
    }
    case "SET_EXERCISE_DESCRIPTION": {
      const [id, description] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return { ...exercise, description };
          }
          return exercise;
        }),
      };
    }
    case "SET_EXERCISE_METHOD": {
      const [id, method] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return { ...exercise, method };
          }
          return exercise;
        }),
      };
    }
    case "SET_EXERCISE_TYPE": {
      const [id, type] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return { ...exercise, type };
          }
          return exercise;
        }),
      };
    }
    case "SET_EXERCISE_HIDDEN": {
      const [id, hidden] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return { ...exercise, hidden };
          }
          return exercise;
        }),
      };
    }
    case "ADD_SET": {
      const exercise = workout.exercises.find(exercise => exercise.id === payload);
      if (!exercise) return workout;

      const biSet = workout.biSets.find(biSet => biSet.includes(exercise.id));

      const predicate = biSet
        ? (exercise: Exercise) => biSet.includes(exercise.id)
        : (exercise: Exercise) => exercise.id === payload;

      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (predicate(exercise)) {
            const lastSet = exercise.sets.at(-1);
            return {
              ...exercise,
              sets: [
                ...exercise.sets,
                lastSet ? { ...lastSet } : { reps: 0, weight: 0, time: { minutes: 0, seconds: 0 } },
              ],
            };
          }
          return exercise;
        }),
      };
    }
    case "REMOVE_SET": {
      const [id, index] = payload;

      const exercise = workout.exercises.find(exercise => exercise.id === id);
      if (!exercise) return workout;

      const biSet = workout.biSets.find(biSet => biSet.includes(exercise.id));

      const predicate = biSet
        ? (exercise: Exercise) => biSet.includes(exercise.id)
        : (exercise: Exercise) => exercise.id === id;

      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (predicate(exercise)) {
            if (exercise.sets.length === 1) return exercise;
            return {
              ...exercise,
              sets: exercise.sets.filter((_, i) => i !== index),
            };
          }
          return exercise;
        }),
      };
    }
    case "SET_SET_REPS": {
      const [id, index, reps] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return {
              ...exercise,
              sets: exercise.sets.map((set, i) => {
                if (i === index) {
                  return { ...set, reps };
                }
                return set;
              }),
            };
          }
          return exercise;
        }),
      };
    }
    case "SET_SET_WEIGHT": {
      const [id, index, weight] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return {
              ...exercise,
              sets: exercise.sets.map((set, i) => {
                if (i === index) {
                  return { ...set, weight };
                }
                return set;
              }),
            };
          }
          return exercise;
        }),
      };
    }
    case "SET_SET_TIME": {
      const [id, index, time] = payload;
      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === id) {
            return {
              ...exercise,
              sets: exercise.sets.map((set, i) => {
                if (i === index) {
                  return { ...set, time };
                }
                return set;
              }),
            };
          }
          return exercise;
        }),
      };
    }
    case "CREATE_BISET": {
      const [firstId, secondId] = payload;
      const first = workout.exercises.find(e => e.id === firstId);
      const second = workout.exercises.find(e => e.id === secondId);
      if (!first || !second) return workout;

      const maxLength = Math.max(first.sets.length, second.sets.length);

      const lastSetFirst = first.sets.at(-1);
      const lastSetSecond = second.sets.at(-1);

      const firstSets = first.sets.concat(
        Array(maxLength - first.sets.length).fill(
          lastSetFirst
            ? { ...lastSetFirst }
            : { reps: 0, weight: 0, time: { minutes: 0, seconds: 0 } },
        ),
      );
      const secondSets = second.sets.concat(
        Array(maxLength - second.sets.length).fill(
          lastSetSecond
            ? { ...lastSetSecond }
            : { reps: 0, weight: 0, time: { minutes: 0, seconds: 0 } },
        ),
      );

      return {
        ...workout,
        biSets: [...workout.biSets, [firstId, secondId]],
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === firstId) {
            return { ...exercise, sets: firstSets };
          }
          if (exercise.id === secondId) {
            return { ...exercise, sets: secondSets };
          }
          return exercise;
        }),
      };
    }
    case "DESTROY_BISET": {
      return { ...workout, biSets: workout.biSets.filter(([first]) => first !== payload) };
    }
    case "SET_BISET_HIDDEN": {
      const [firstId, hidden] = payload;
      const biSet = workout.biSets.find(([first]) => first === firstId);
      if (!biSet) return workout;
      const [, secondId] = biSet;

      return {
        ...workout,
        exercises: workout.exercises.map(exercise => {
          if (exercise.id === firstId || exercise.id === secondId) {
            return { ...exercise, hidden };
          }
          return exercise;
        }),
      };
    }
  }
};

const initialWorkout = {
  name: "",
  days: [],
  exercises: [],
  biSets: [],
};

export const useWorkout = () => {
  const [workout, dispatch] = useReducer(workoutReducer, initialWorkout);

  const idGenerator = useRef(1);

  useEffect(() => {
    const ids = workout.exercises.map(e => e.id).filter(n => typeof n === "number") as number[];

    if (ids.length === 0) {
      idGenerator.current = 1;
    } else {
      idGenerator.current = Math.max(...ids) + 1;
    }
  }, [workout.exercises]);

  const groups = useMemo(
    () =>
      workout.exercises.reduce((acc, exercise) => {
        const isBiSet = workout.biSets.some(([, second]) => second === exercise.id);
        if (isBiSet) return acc;

        const hasBiSet = workout.biSets.find(([first]) => first === exercise.id);
        if (!hasBiSet) {
          return [...acc, exercise];
        }

        const [, secondId] = hasBiSet;
        const second = workout.exercises.find(e => e.id === secondId);
        if (!second) return acc;

        return [...acc, { id: exercise.id, exercises: [exercise, second] as const }];
      }, [] as (ExerciseGroup | Exercise)[]),
    [workout.exercises, workout.biSets],
  );

  const actions = useMemo(
    () => ({
      setWorkout: (workout: Workout) => dispatch(["SET_WORKOUT", workout]),
      setName: (name: string) => dispatch(["SET_NAME", name]),
      setDays: (days: Weekday[]) => dispatch(["SET_DAYS", days]),
      setExercises: (exercises: Exercise[]) => dispatch(["SET_EXERCISES", exercises]),
      addExercise: () => dispatch(["ADD_EXERCISE", idGenerator.current++]),
      removeExercise: (id: Id) => dispatch(["REMOVE_EXERCISE", id]),
      setExerciseId: (id: Id, exerciseId: string) =>
        dispatch(["SET_EXERCISE_ID", [id, exerciseId]]),
      setExerciseDescription: (id: Id, description: string) =>
        dispatch(["SET_EXERCISE_DESCRIPTION", [id, description]]),
      setExerciseMethod: (id: Id, method: Method) =>
        dispatch(["SET_EXERCISE_METHOD", [id, method]]),
      setExerciseType: (id: Id, type: "REPS" | "TIME") =>
        dispatch(["SET_EXERCISE_TYPE", [id, type]]),
      setExerciseHidden: (id: Id, hidden: boolean) =>
        dispatch(["SET_EXERCISE_HIDDEN", [id, hidden]]),
      addSet: (id: Id) => dispatch(["ADD_SET", id]),
      removeSet: (id: Id, index: number) => dispatch(["REMOVE_SET", [id, index]]),
      setSetReps: (id: Id, index: number, reps: number) =>
        dispatch(["SET_SET_REPS", [id, index, reps]]),
      setSetWeight: (id: Id, index: number, weight: number) =>
        dispatch(["SET_SET_WEIGHT", [id, index, weight]]),
      setSetTime: (id: Id, index: number, time: { minutes: number; seconds: number }) =>
        dispatch(["SET_SET_TIME", [id, index, time]]),
      createBiSet: (firstId: Id, secondId: Id) => dispatch(["CREATE_BISET", [firstId, secondId]]),
      destroyBiSet: (id: Id) => dispatch(["DESTROY_BISET", id]),
      setBiSetHidden: (id: Id, hidden: boolean) => dispatch(["SET_BISET_HIDDEN", [id, hidden]]),
    }),
    [],
  );

  return [{ workout, groups }, actions] as const;
};

export type WorkoutActions = ReturnType<typeof useWorkout>[1];

export const useStoredWorkout = (key: string) => {
  const [state, actions] = useWorkout();
  const [verified, setVerified] = useState(false);

  // this is a delayed state initializer, we want to useEffect to run this not on the server,
  // but only when the client renders to make sure we have access to the window object
  useEffect(() => {
    try {
      const json = window.localStorage.getItem(key);
      const value = json ? workoutParser.parse(JSON.parse(json)) : initialWorkout;
      actions.setWorkout(value);
    } catch (error) {
      console.log(error);
      window.localStorage.removeItem(key);
      actions.setWorkout(initialWorkout);
    }
    setVerified(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (verified) {
      window.localStorage.setItem(key, JSON.stringify(state.workout));
    }
  }, [verified, key, state.workout]);

  const resetStorage = () => {
    window.localStorage.removeItem(key);
    actions.setWorkout(initialWorkout);
  };

  return [state, actions, resetStorage] as const;
};
