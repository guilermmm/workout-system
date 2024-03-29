import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSONValue } from "superjson/dist/types";
import type { ZodType } from "zod";

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

export const useLocalStorage = <T extends JSONValue>(
  key: string,
  parser: ZodType<T>,
  initialValue: T,
) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [verified, setVerified] = useState(false);

  const setValue = useCallback(
    (value: T | ((value: T) => T)) => {
      const newValue = typeof value === "function" ? value(storedValue) : value;
      try {
        const parsedValue = parser.parse(newValue);
        window.localStorage.setItem(key, JSON.stringify(parsedValue));
        setStoredValue(newValue);
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue, parser],
  );

  // this is a delayed state initializer, we want to useEffect to run this not on the server,
  // but only when the client renders to make sure we have access to the window object
  useEffect(() => {
    try {
      const json = window.localStorage.getItem(key);
      const value = json ? parser.parse(JSON.parse(json)) : initialValue;
      setValue(value);
      setVerified(true);
    } catch (error) {
      console.log(error);
      setValue(initialValue);
      setVerified(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, resetValue, verified] as const;
};

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function never() {
  return new Promise(() => void 0);
}

export const useClickOutside = <T extends HTMLElement>(callback: (e: MouseEvent) => void) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback(e);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref, callback]);

  return ref;
};

export function useEndOfScroll<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T | null>(null);

  const endOfScrollRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    const { scrollTop, scrollHeight, clientHeight } = ref.current;

    const isBottom = scrollTop + clientHeight >= scrollHeight;

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

  return ref;
}

export const getDateArrayFromDate = (date: Date) => {
  const dayOfTheWeek = date.getDay();
  const lastDayOfTheWeek = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 6 - dayOfTheWeek,
  );
  const firstDayOfTheFourWeeksBefore = new Date(
    lastDayOfTheWeek.getFullYear(),
    lastDayOfTheWeek.getMonth(),
    lastDayOfTheWeek.getDate() - 27,
  );

  const daysArray = [];

  for (let i = 0; i < 28; i++) {
    const currentDate = new Date(firstDayOfTheFourWeeksBefore);
    currentDate.setDate(firstDayOfTheFourWeeksBefore.getDate() + i);
    daysArray.push({ day: currentDate.getDate(), month: currentDate.getMonth() });
  }

  return daysArray;
};

export const useFormValidation = <T>(
  value: T,
  validate: (value: T) => string | undefined | false,
  validateOnFirstRender = true,
) => {
  const [error, setError] = useState<string | undefined>(() =>
    validateOnFirstRender ? validate?.(value) || undefined : undefined,
  );

  const handleBlur = useCallback(() => {
    const errorValue = validate?.(value);
    const error = errorValue === false ? undefined : errorValue;

    setError(error);

    return error;
  }, [value, validate]);

  const resetError = useCallback(() => setError(undefined), []);

  const props = useMemo(
    () => ({
      onFocus: () => setError(undefined),
      onBlur: handleBlur,
      error,
    }),
    [handleBlur, error],
  );

  const methods = useMemo(() => ({ error: handleBlur, resetError }), [handleBlur, resetError]);

  return [props, methods] as const;
};

export const validateEmail = (email: string) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

export const getAge = (birthDate: Date) => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) return age - 1;

  return age;
};
