import type { Exercise } from "@prisma/client";
import { useState } from "react";

export const join = (array: string[], separator = ", ") => {
  return array.length === 0
    ? ""
    : array.length === 1
    ? array[0]!
    : array.slice(0, -1).join(separator) + " e " + array.slice(-1)[0]!;
};

export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const classList = (...classes: (string | Record<string, boolean>)[]) => {
  return classes
    .map(c => {
      return typeof c === "string"
        ? c
        : Object.entries(c)
            .filter(([, v]) => v)
            .map(([k]) => k);
    })
    .flat()
    .join(" ");
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: Partial<T> | ((val: T) => Partial<T>)) => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    const valueToStore = typeof newValue === "object" ? { ...storedValue, ...newValue } : newValue;

    setStoredValue(valueToStore);

    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
};

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function never() {
  return new Promise(() => void 0);
}

export function reduceByCategory(
  acc: { category: string; exercises: Exercise[] }[],
  exercise: Exercise,
) {
  const existingCategory = acc.find(item => item.category === exercise.category);

  if (existingCategory) {
    existingCategory.exercises.push(exercise);
  } else {
    acc.push({ category: exercise.category, exercises: [exercise] });
  }

  return acc;
}
