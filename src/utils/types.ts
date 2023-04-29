import type { Datasheet, Prisma } from "@prisma/client";
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
