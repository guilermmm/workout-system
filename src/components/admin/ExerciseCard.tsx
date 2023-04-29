import { Method } from "@prisma/client";
import { classList, useFormValidation } from "../../utils";
import type { RouterOutputs } from "../../utils/api";
import { methodTranslation } from "../../utils/consts";
import Dropdown from "../Dropdown";
import NumberInput from "../NumberInput";
import Select from "../Select";
import TextArea from "../TextArea";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import PlusIcon from "../icons/PlusIcon";
import TrashIcon from "../icons/TrashIcon";
import XMarkIcon from "../icons/XMarkIcon";

export type ExerciseBase = {
  id: number | string;
  exerciseId: string;
  description: string | null;
  method: Method;
  type: "reps" | "time";
  biSet: number | string | null;
  sets: {
    reps: number;
    weightKg: number;
    time: { minutes: number; seconds: number };
  }[];
  hidden: boolean;
};

type ExerciseCardProps<Exercise extends ExerciseBase> = {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete?: () => void;
  categories: RouterOutputs["exercise"]["getGroups"];
  otherExercises?: Exercise[];
  dragHandle?: React.ReactNode;
  collapsed?: boolean;
  disabled?: boolean;
};

const ExerciseCard = <Exercise extends ExerciseBase>({
  exercise,
  onEdit,
  onDelete,
  categories,
  otherExercises,
  dragHandle,
  collapsed,
  disabled,
}: ExerciseCardProps<Exercise>) => {
  const exerciseIdProps = useFormValidation(
    exercise.exerciseId,
    v => v === "" && "Selecione um exercício",
    true,
  );

  const updateSets = (newSets: typeof exercise.sets) => {
    if (newSets.length === 0) {
      newSets = [{ reps: 0, weightKg: 0, time: { minutes: 0, seconds: 0 } }];
    }

    onEdit({ ...exercise, sets: newSets });
  };

  const updateMethod = (newMethod: Method) => onEdit({ ...exercise, method: newMethod });

  const updateType = (newType: typeof exercise.type) => onEdit({ ...exercise, type: newType });

  const setHidden = (hidden: boolean) => onEdit({ ...exercise, hidden });

  const handleSelectExercise: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const newExercise = categories
      .flatMap(group => group.exercises)
      .find(exercise => exercise.id === e.target.value);

    if (newExercise) {
      onEdit({ ...exercise, exerciseId: newExercise.id });
    }
  };

  const setBiSet = (biSet: NonNullable<Exercise["biSet"]>) => onEdit({ ...exercise, biSet });

  const isCollapsed = collapsed || exercise.hidden;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white p-2 shadow-md">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <button
        className={classList(
          "absolute rounded-full bg-white p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
          {
            "right-2 top-14 sm:right-14 sm:top-2": !!onDelete && !isCollapsed,
            "right-14 top-2": !!onDelete && isCollapsed,
            "right-2 top-2": !onDelete,
          },
        )}
        onClick={() => setHidden(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>
      <div
        className={classList(
          "flex h-10 flex-row items-center justify-between transition-all duration-200",
          {
            "max-h-[2.5rem]": isCollapsed,
            "max-h-0 overflow-y-hidden": !isCollapsed,
          },
        )}
      >
        <div className="ml-2 w-1/3 text-sm font-medium">
          {categories.flatMap(g => g.exercises).find(e => e.id === exercise.exerciseId)?.name ?? (
            <span className="rounded p-0.5 font-medium text-red-500">
              Exercício não selecionado
            </span>
          )}
        </div>
        <div className="w-1/3 text-xs text-gray-500">
          {exercise.sets.length || 1} {exercise.sets.length > 1 ? "séries" : "série"}
        </div>
        <div className="w-10" />
      </div>
      <div
        className={classList("flex flex-col justify-between gap-2 transition-all duration-200", {
          "max-h-[100rem]": !isCollapsed,
          "max-h-0 overflow-y-hidden": isCollapsed,
        })}
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex">
            <div className="flex grow flex-col gap-2">
              <div className="flex grow flex-col gap-2 bg-white py-1 sm:flex-row">
                <Select
                  className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
                  value={exercise.exerciseId}
                  onChange={handleSelectExercise}
                  label="Exercício"
                  disabled={disabled}
                  {...exerciseIdProps}
                >
                  <option value="" className="text-slate-600" disabled>
                    Selecione um exercício
                  </option>
                  {categories.map(group => (
                    <optgroup
                      label={group.category}
                      key={group.category}
                      className="my-2 block text-sm text-slate-700/70"
                    >
                      {group.exercises.map(e => (
                        <option key={e.id} className="text-blue-600" value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
                <Select
                  className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
                  value={exercise.method}
                  onChange={e => updateMethod(e.target.value as Method)}
                  label="Método"
                  disabled={disabled}
                >
                  {Object.values(Method).map(method => (
                    <option key={method} value={method} className="text-sm">
                      {methodTranslation[method]}
                    </option>
                  ))}
                </Select>
              </div>
              <TextArea
                className="h-full w-full rounded-lg bg-white"
                label="Descrição"
                value={exercise.description ?? ""}
                onChange={description => onEdit({ ...exercise, description })}
                disabled={disabled}
              />
            </div>
            {onDelete && !disabled ? (
              <div className="mt-24 ml-2 mr-0 flex flex-col items-start gap-2 sm:mr-24 sm:mt-0 sm:flex-row-reverse">
                <button
                  className="rounded-full bg-white p-2 text-red-400 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                  onClick={onDelete}
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="ml-12" />
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex grow-1 flex-col gap-2">
            <div className="flex grow flex-col items-center justify-center">
              <span
                className={classList("mb-1 text-xs font-medium", {
                  "text-gray-900": exercise.type === "reps",
                  "text-gray-500": exercise.type !== "reps",
                })}
              >
                Repetições
              </span>
              <div className="inline-flex">
                <label className="relative cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={exercise.type === "time"}
                    onChange={e => updateType(e.target.checked ? "time" : "reps")}
                    className="peer sr-only"
                    disabled={disabled}
                  />
                  <div
                    className={classList(
                      "peer h-5 w-9 rounded-full bg-blue-600",
                      "after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']",
                      "peer-checked:after:translate-x-full peer-checked:after:border-white",
                      "peer-focus:outline-none peer-focus:ring-0",
                      "disabled:after:bg-gray-300 peer-disabled:bg-gray-300",
                    )}
                  />
                </label>
              </div>
              <span
                className={classList("text-xs font-medium", {
                  "text-gray-900": exercise.type === "time",
                  "text-gray-500": exercise.type !== "time",
                })}
              >
                Tempo
              </span>
            </div>
            <div className="flex flex-col">
              {otherExercises && otherExercises.length !== 0 && (
                <div className="flex items-center justify-center overflow-visible">
                  <Dropdown
                    className="flex items-center justify-center"
                    options={otherExercises}
                    onSelect={e => setBiSet(e.id)}
                    itemToKey={e => e.id.toString()}
                    itemToString={exercise =>
                      categories
                        .flatMap(group => group.exercises)
                        .find(e => e.id === exercise.exerciseId)!.name
                    }
                    disabled={disabled}
                  >
                    {(_, toggle) => (
                      <button
                        className="flex h-10 flex-row items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 text-sm font-medium text-slate-900 shadow-md"
                        onClick={toggle}
                      >
                        Criar bi-set
                      </button>
                    )}
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
          <div className="flex grow-2 flex-col text-sm">
            <div className="flex flex-col items-center rounded-md px-2 py-1">
              <span className="mb-2 font-medium text-slate-700">Séries</span>
              {exercise.sets.map((set, index) => (
                <div
                  className="m-0.5 flex w-full items-center justify-between rounded border-1 bg-white p-1.5 shadow-md"
                  key={index}
                >
                  <div className="flex grow flex-row items-center gap-1">
                    {exercise.type === "reps" ? (
                      <NumberInput
                        label="Repetições"
                        className="grow bg-white"
                        value={set.reps}
                        onChange={n => {
                          const newSets = [...exercise.sets];
                          newSets[index]!.reps = n;
                          updateSets(newSets);
                        }}
                        min={0}
                        disabled={disabled}
                      />
                    ) : (
                      <>
                        <NumberInput
                          label="Minutos"
                          className="grow bg-white"
                          value={set.time.minutes}
                          onChange={n => {
                            const newSets = [...exercise.sets];
                            newSets[index]!.time.minutes = n;
                            updateSets(newSets);
                          }}
                          min={0}
                          max={1000}
                          disabled={disabled}
                        />
                        <NumberInput
                          label="Segundos"
                          className="grow bg-white"
                          value={set.time.seconds}
                          onChange={n => {
                            const newSets = [...exercise.sets];
                            newSets[index]!.time.seconds = n;
                            updateSets(newSets);
                          }}
                          min={0}
                          max={59}
                          disabled={disabled}
                        />
                      </>
                    )}
                    <NumberInput
                      label="Peso (kg)"
                      className="grow bg-white"
                      value={set.weightKg}
                      onChange={n => {
                        const newSets = [...exercise.sets];
                        newSets[index]!.weightKg = n;
                        updateSets(newSets);
                      }}
                      min={0}
                      step={0.01}
                      max={1000}
                      disabled={disabled}
                    />
                  </div>
                  {exercise.sets.length !== 1 && (
                    <div className="ml-1 flex items-center">
                      <button
                        className="rounded-full border-1 border-gray-300 p-1 text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          const newSets = [...exercise.sets];
                          newSets.splice(index, 1);
                          updateSets(newSets);
                        }}
                        disabled={disabled}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="m-0.5 w-full">
                <button
                  className="flex w-full items-center justify-center rounded border-1 bg-white p-1.5 shadow-md hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    const lastSet = exercise.sets.at(-1);
                    if (lastSet) {
                      updateSets([
                        ...exercise.sets,
                        {
                          reps: lastSet.reps,
                          weightKg: lastSet.weightKg,
                          time: { minutes: lastSet.time.minutes, seconds: lastSet.time.seconds },
                        },
                      ]);
                    } else {
                      updateSets([{ reps: 0, weightKg: 0, time: { minutes: 0, seconds: 0 } }]);
                    }
                  }}
                  disabled={disabled}
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
