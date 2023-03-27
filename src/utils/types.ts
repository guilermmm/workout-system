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
  : T extends object
  ? { [K in keyof T]: ParseSets<T[K]> }
  : T;

export type ParseBiSets<T> = T extends { biSets: Prisma.JsonValue }
  ? Simplify<Omit<T, "biSets"> & { biSets: BiSets }>
  : T extends object
  ? { [K in keyof T]: ParseBiSets<T[K]> }
  : T;

export type ParseJsonValues<T> = Simplify<ParseSets<T> & ParseBiSets<T>>;

export type ParsedDatasheet = Omit<Datasheet, "profileId" | "createdAt">;
