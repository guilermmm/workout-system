export type Sets = RepSet[] | TimeSet[];

export type RepSet = {
  reps: number;
  weight: number;
};

export type TimeSet = {
  time: number;
  weight: number;
};

export type BiSets = [string, string][]