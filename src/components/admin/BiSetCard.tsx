import React, { useState } from "react";
import { classList } from "../../utils";
import type { RouterOutputs } from "../../utils/api";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import XMarkIcon from "../icons/XMarkIcon";
import type { ExerciseBase } from "./ExerciseCard";
import ExerciseCard from "./ExerciseCard";

type BiSetCardProps<Exercise extends ExerciseBase> = {
  first: Exercise;
  second: Exercise;
  separate: () => void;
  setExercises: (fn: (exercises: Exercise[]) => Exercise[]) => void;
  categories: RouterOutputs["exercise"]["getGroups"];
  dragHandle: React.ReactNode;
  collapsed: boolean;
  disabled?: boolean;
};

const BiSetCard = <Exercise extends ExerciseBase>({
  first,
  second,
  separate,
  setExercises,
  categories,
  dragHandle,
  collapsed,
  disabled,
}: BiSetCardProps<Exercise>) => {
  const [hidden, setHidden] = useState(false);

  const isCollapsed = collapsed || hidden;

  const setCollapsed = (collapsed: boolean) => {
    setHidden(collapsed);
    const collapseExercises = () =>
      setExercises(exercises =>
        exercises.map(e =>
          e.id === first.id || e.id === second.id ? { ...e, hidden: collapsed } : e,
        ),
      );

    if (collapsed) {
      setTimeout(collapseExercises, 200);
    } else {
      collapseExercises();
    }
  };

  return (
    <div className="relative m-2 flex flex-col rounded-xl bg-blue-500 pt-2">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <div className="absolute left-4 top-4">
        <span className="font-medium text-gray-50">Bi-set</span>
      </div>
      <button
        className={classList(
          "absolute right-14 top-2 rounded-full bg-white p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
        )}
        onClick={() => setCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      <div
        className={classList("h-12 transition-all duration-200", {
          "max-h-[3rem]": isCollapsed,
          "max-h-0 overflow-y-hidden": !isCollapsed,
        })}
      >
        <div className="mx-2 flex h-full w-full items-center justify-center pl-16 pr-28 pb-2">
          <div className="flex w-full flex-col items-center justify-center gap-1 text-sm">
            <ExerciseLabel>
              {categories.flatMap(g => g.exercises).find(e => e.id === first.exerciseId)?.name}
            </ExerciseLabel>
            <ExerciseLabel>
              {categories.flatMap(g => g.exercises).find(e => e.id === second.exerciseId)?.name}
            </ExerciseLabel>
          </div>
        </div>
      </div>
      <div
        className={classList("flex flex-col transition-all duration-200", {
          "max-h-[100rem]": !isCollapsed,
          "max-h-0 overflow-y-hidden": isCollapsed,
        })}
      >
        <div className="mr-2 h-10 items-center justify-end pr-24 pl-16 pb-2">
          <button
            className="ml-auto flex justify-center rounded-full bg-slate-50 p-2 text-blue-500 transition-colors hover:bg-slate-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={separate}
            disabled={disabled}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col items-stretch">
          <ExerciseCard
            exercise={first}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === first.id ? it : e)))
            }
            disabled={disabled}
          />
          <ExerciseCard
            exercise={second}
            categories={categories}
            onEdit={it =>
              setExercises(exercises => exercises.map(e => (e.id === second.id ? it : e)))
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

const ExerciseLabel = ({ children }: { children?: string }) => {
  return (
    <div className="flex max-w-full items-center justify-center leading-none">
      {children ? (
        <div className="truncate text-white">{children}</div>
      ) : (
        <div className="truncate rounded bg-slate-50 px-0.5 pb-0.5 text-red-500">
          Exercício não selecionado
        </div>
      )}
    </div>
  );
};

export default BiSetCard;
