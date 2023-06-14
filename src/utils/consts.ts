import type { Datasheet, Method, Weekday } from "@prisma/client";

export const weekdaysOrder = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const satisfies Record<Weekday, number>;

export const weekdaysTranslation = {
  Monday: "Segunda",
  Tuesday: "Terça",
  Wednesday: "Quarta",
  Thursday: "Quinta",
  Friday: "Sexta",
  Saturday: "Sábado",
  Sunday: "Domingo",
} as const satisfies Record<Weekday, string>;

export const weekdaysAbbrv = {
  Sunday: "DOM",
  Monday: "SEG",
  Tuesday: "TER",
  Wednesday: "QUA",
  Thursday: "QUI",
  Friday: "SEX",
  Saturday: "SAB",
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

export type DatasheetMeasurement = keyof Omit<Datasheet, "id" | "profileId" | "createdAt">;

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
} as const satisfies Record<DatasheetMeasurement, string>;

export const dataSheetUnit = {
  weight: "kg",
  height: "cm",
  thorax: "cm",
  waist: "cm",
  abdomen: "cm",
  hips: "cm",
  rightThigh: "cm",
  leftThigh: "cm",
  rightArm: "cm",
  leftArm: "cm",
  rightCalf: "cm",
  leftCalf: "cm",
} as const satisfies Record<DatasheetMeasurement, string>;

export const dataSheetStep = {
  weight: 0.01,
  height: 0.1,
  thorax: 0.1,
  waist: 0.1,
  abdomen: 0.1,
  hips: 0.1,
  rightThigh: 0.1,
  leftThigh: 0.1,
  rightArm: 0.1,
  leftArm: 0.1,
  rightCalf: 0.1,
  leftCalf: 0.1,
} as const satisfies Record<DatasheetMeasurement, number>;

export const datasheetLayout = [
  ["weight", "height"],
  ["thorax", "waist"],
  ["abdomen", "hips"],
  ["leftArm", "rightArm"],
  ["leftThigh", "rightThigh"],
  ["leftCalf", "rightCalf"],
] satisfies [DatasheetMeasurement, DatasheetMeasurement][];

export const methodTranslation = {
  Standard: "Normal",
  DropSet: "Drop Set",
  RestPause: "Rest Pause",
  Isometric: "Isometria",
  Pyramid: "Pirâmide",
  PeakContraction: "Pico de Contração",
} as const satisfies Record<Method, string>;

export const methodExplanation = {
  Standard: "Realize o exercício normalmente.",
  DropSet: "Diminua o peso em 20% e execute as repetições novamente, repita até duas vezes.",
  RestPause: "Realize o exercício normalmente, mas descanse 10 segundos entre cada série.",
  Isometric: "Realize uma repetição e segure a contração pelo tempo especificado.",
  Pyramid:
    "Realize o exercício normalmente, mas aumente ou diminua o peso dependendo da observação em 20% a cada série.",
  PeakContraction:
    "Realize o exercício normalmente, mas segure a contração por 2 a 5 segundos em cada repetição.",
} as const satisfies Record<Method, string>;

export const motivationalPhrases = [
  "O esforço de hoje será seu motivo de orgulho amanhã.",
  "Acredite em você, você é capaz.",
  "O projeto verão que dá certo é aquele que é feito todos os dias.",
  "A disciplina é a mãe do êxito.",
  "A persistência realiza o impossível.",
  "A persistência é o caminho do êxito.",
  "O cansaço de hoje é o orgulho de amanhã.",
  "Por hoje está pago, mas amanhã tem mais.",
  "Seja paciente, o resultado é certo.",

  "Lembre-se de que cada treino é um passo em direção aos seus objetivos.",
  "Acredite no seu potencial e nada poderá detê-lo.",
  "Grandes conquistas começam com pequenos passos.",
  "Nunca desista. O caminho para o sucesso está cheio de obstáculos, mas você é capaz de superá-los.",
  "O treino de hoje é o resultado que você verá no espelho amanhã.",
  "A dor que você sente hoje é a força que você sentirá amanhã.",
  "A única maneira de alcançar seus objetivos é através da persistência.",
  "Não pare quando estiver cansado, pare quando estiver satisfeito.",
  "Acredite em si mesmo e todo o resto virá naturalmente.",
  "Seja a versão melhorada de si mesmo a cada dia.",
  "Cada repetição conta. Faça cada uma delas valer a pena.",
  "Você é capaz de muito mais do que imagina. Acredite e conquiste.",
  "Supere seus limites, um passo de cada vez.",
  "O suor de hoje é a recompensa de amanhã.",
  "Transforme o impossível em possível, um treino de cada vez.",
] as const;
