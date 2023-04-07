import type { Exercise } from "@prisma/client";
import type { MutableRefObject, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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

export const useOutsideClick = <T extends HTMLElement>(callback: (e: Event) => void) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClick = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback(e);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref, callback]);

  return ref as MutableRefObject<T>;
};

export default function useEndOfScroll<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
) {
  const endOfScrollRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    const { scrollTop, scrollHeight, clientHeight } = ref.current;

    const isBottom = scrollHeight <= clientHeight || scrollHeight - scrollTop === clientHeight;

    if (isBottom) {
      endOfScrollRef.current = true;
      callback();
    } else if (!isBottom) {
      endOfScrollRef.current = false;
    }
  }, [ref, callback]);

  useEffect(() => {
    const el = ref.current;
    el?.addEventListener("scroll", handleScroll);
    el?.addEventListener("resize", handleScroll);
    el?.addEventListener("wheel", handleScroll);
    el?.addEventListener("touchmove", handleScroll);
    return () => {
      el?.removeEventListener("scroll", handleScroll);
      el?.removeEventListener("resize", handleScroll);
      el?.removeEventListener("wheel", handleScroll);
      el?.removeEventListener("touchmove", handleScroll);
    };
  }, [ref, handleScroll]);
}

export const getDateArrayFromDate = (startDate: Date) => {
  const currentDate = new Date();
  const timeDiff = Math.abs(currentDate.getTime() - startDate.getTime());
  const numDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const daysArray = [];

  for (let i = 0; i <= numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    daysArray.push({ day: currentDate.getDate(), month: currentDate.getMonth() });
  }

  return daysArray;
};
