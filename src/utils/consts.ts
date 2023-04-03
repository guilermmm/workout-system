import type { Datasheet, Method, Weekday } from "@prisma/client";

export const weekdaysTranslation = {
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
  Saturday: "Sábado",
  Sunday: "Domingo",
} as const satisfies Record<Weekday, string>;

export const weekdaysAbbrv = {
  Monday: "SEG",
  Tuesday: "TER",
  Wednesday: "QUA",
  Thursday: "QUI",
  Friday: "SEX",
  Saturday: "SAB",
  Sunday: "DOM",
} as const satisfies Record<Weekday, string>;

export const jsDateToWeekday = (date: Date): Weekday => {
  const day = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const dates = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  } as const;

  return dates[day];
};

export const dataSheetTranslation = {
  weight: "Peso",
  height: "Altura",
  thorax: "Tórax",
  waist: "Cintura",
  abdomen: "Abdômen",
  hips: "Quadril",
  rightThigh: "Perna Dir.",
  leftThigh: "Perna Esq.",
  rightArm: "Braço Dir.",
  leftArm: "Braço Esq.",
  rightCalf: "Panturrilha Dir.",
  leftCalf: "Panturrilha Esq.",
} as const satisfies Record<keyof Omit<Datasheet, "id" | "profileId" | "createdAt">, string>;

export const methodTranslation = {
  Standard: "Normal",
  DropSet: "Drop Set",
  PeakContraction: "Pico de Contração",
  RestPause: "Rest Pause",
} as const satisfies Record<Method, string>;
