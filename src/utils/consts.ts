import type { Datasheet, Method, Weekday } from "@prisma/client";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

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

export const errorCodeMessage = {
  INTERNAL_SERVER_ERROR: {
    title: "Erro interno do servidor",
    explanation: [
      "Ocorreu um erro interno no servidor, tente novamente mais tarde.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  BAD_REQUEST: {
    title: "Requisição inválida",
    explanation: [
      "Ocorreu um erro com a sua requisição, verifique se os dados estão corretos e tente novamente.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  CLIENT_CLOSED_REQUEST: {
    title: "Requisição cancelada",
    explanation: [
      "Sua requisição foi cancelada antes de ser concluída, tente novamente.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  CONFLICT: {
    title: "Conflito",
    explanation: [
      "Ocorreu um conflito com os dados enviados, verifique se os dados estão corretos e tente novamente.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  FORBIDDEN: {
    title: "Acesso negado",
    explanation: [
      "Você não tem permissão para acessar este recurso ou realizar esta ação.",
      "Se você acredita que isso é um erro, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  METHOD_NOT_SUPPORTED: {
    title: "Ação não suportada",
    explanation: [
      "A ação que você está tentando realizar não é suportada.",
      "Se você acredita que isso é um erro, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  NOT_FOUND: {
    title: "Não encontrado",
    explanation: [
      "O recurso que você está tentando acessar não foi encontrado.",
      "Se você não sabe o que pode ter causado isso, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  PARSE_ERROR: {
    title: "Erro de análise",
    explanation: [
      "Ocorreu um erro ao analisar os dados enviados, verifique se os dados estão corretos e tente novamente.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  PAYLOAD_TOO_LARGE: {
    title: "Dados muito grandes",
    explanation: [
      "Os dados que você está tentando enviar são muito grandes, tente enviar menos dados.",
      "Se você não sabe o que pode ter causado isso, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  PRECONDITION_FAILED: {
    title: "Pré-condição falhou",
    explanation: [
      "A pré-condição para realizar esta ação falhou.",
      "A ação que você está tentando realizar precisa de um recurso que não existe ou não está disponível.",
      "Se você acredita que isso é um erro, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  TIMEOUT: {
    title: "Tempo limite excedido",
    explanation: [
      "O tempo limite para realizar esta ação foi atingido.",

      "Talvez você esteja com uma conexão de internet lenta, ou o servidor esteja sobrecarregado.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  TOO_MANY_REQUESTS: {
    title: "Muitas requisições",
    explanation: [
      "Você está fazendo muitas requisições ao servidor em um curto período de tempo, tente novamente mais tarde.",
      "Se o erro persistir, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
  UNAUTHORIZED: {
    title: "Não autorizado",
    explanation: [
      "Você não tem permissão para acessar este recurso ou realizar esta ação.",
      "Se você acredita que isso é um erro, entre em contato com a equipe da academia para informar o ocorrido.",
    ],
  },
} as const satisfies Record<
  TRPC_ERROR_CODE_KEY,
  {
    title: string;
    explanation: readonly string[];
  }
>;
