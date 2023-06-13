import { Method } from "@prisma/client";
import { classList, useFormValidation } from "../../utils";
import type { RouterOutputs } from "../../utils/api";
import { methodTranslation } from "../../utils/consts";
import type { Exercise, Set, WorkoutActions } from "../../utils/workout";
import Dropdown from "../Dropdown";
import NumberInput from "../NumberInput";
import Select from "../Select";
import TextArea from "../TextArea";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import PlusIcon from "../icons/PlusIcon";
import TrashIcon from "../icons/TrashIcon";
import XMarkIcon from "../icons/XMarkIcon";

type ExerciseCardProps = {
  exercise: Exercise;
  actions: WorkoutActions;
  categories: RouterOutputs["exercise"]["getGroups"];
  otherExercises?: Exercise[];
  dragHandle?: React.ReactNode;
  collapsed?: boolean;
  disabled?: boolean;
  isOnBiSet?: boolean;
};

const ExerciseCard = ({
  exercise,
  actions,
  categories,
  otherExercises,
  dragHandle,
  collapsed,
  disabled,
  isOnBiSet = false,
}: ExerciseCardProps) => {
  const [exerciseIdProps] = useFormValidation(
    exercise.exerciseId,
    v => v === "" && "Selecione um exercício",
  );

  const handleSelectExercise: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const newExercise = categories
      .flatMap(group => group.exercises)
      .find(exercise => exercise.id === e.target.value);

    if (newExercise) {
      actions.setExerciseId(exercise.id, newExercise.id);
    }
  };

  const isCollapsed = collapsed || exercise.hidden;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white p-2 shadow-md">
      <div className="absolute right-2 top-2">{dragHandle}</div>
      <button
        className={classList(
          "absolute rounded-full bg-white p-2 text-gray-400 shadow-md transition-all hover:bg-gray-300 hover:text-white",
          {
            "right-2 top-14 sm:right-14 sm:top-2": !isOnBiSet && !isCollapsed,
            "right-14 top-2": !isOnBiSet && isCollapsed,
            "right-2 top-2": isOnBiSet,
          },
        )}
        onClick={() => actions.setExerciseHidden(exercise.id, !isCollapsed)}
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
                  onChange={e => actions.setExerciseMethod(exercise.id, e.target.value as Method)}
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
                label="Observação"
                value={exercise.description ?? ""}
                onChange={d => actions.setExerciseDescription( exercise.id, d)}
                disabled={disabled}
              />
            </div>
            {!isOnBiSet && !disabled ? (
              <div className="mt-24 ml-2 mr-0 flex flex-col items-start gap-2 sm:mr-24 sm:mt-0 sm:flex-row-reverse">
                <button
                  className="rounded-full bg-white p-2 text-red-400 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                  onClick={() => actions.removeExercise(exercise.id)}
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="ml-12" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex grow-1 flex-row gap-2 sm:flex-col">
            <div className="flex w-full grow flex-row items-center justify-center gap-1 sm:flex-col">
              <span
                className={classList("text-xs font-medium leading-none", {
                  "text-gray-900": exercise.type === "REPS",
                  "text-gray-500": exercise.type !== "REPS",
                })}
              >
                Repetições
              </span>
              <div className="inline-flex">
                <label className="relative cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={exercise.type === "TIME"}
                    onChange={e => actions.setExerciseType(exercise.id, e.target.checked ? "TIME" : "REPS")}
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
                className={classList("text-xs font-medium leading-none", {
                  "text-gray-900": exercise.type === "TIME",
                  "text-gray-500": exercise.type !== "TIME",
                })}
              >
                Tempo
              </span>
            </div>
            <div className="flex w-full flex-col">
              {otherExercises && otherExercises.length !== 0 && (
                <div className="flex items-center justify-center overflow-visible">
                  <Dropdown
                    className="flex items-center justify-center"
                    options={otherExercises}
                    onSelect={e => actions.createBiSet(exercise.id, e.id)}
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
                <SetCard
                  key={index}
                  exercise={exercise}
                  set={set}
                  index={index}
                  actions={actions}
                  disabled={disabled}
                />
              ))}
              <div className="m-0.5 w-full">
                <button
                  className="flex w-full items-center justify-center rounded border-1 bg-white p-1.5 shadow-md hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => actions.addSet(exercise.id)}
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

type SetProps = {
  exercise: Exercise;
  set: Set;
  index: number;
  actions: WorkoutActions;
  disabled?: boolean;
};

const SetCard = ({
  exercise,
  set,
  index,
  actions,
  disabled,
}: SetProps) => {
  const [repsProps] = useFormValidation(set.reps, n => {
    if (n < 1) return "Número de repetições deve ser maior que 0";
    if (n % 1 !== 0) return "Número de repetições deve ser inteiro";
  });

  const [weightProps] = useFormValidation(set.weight, n => {
    if (n < 0) return "Peso deve ser maior ou igual a 0";
    if (n % 0.5 !== 0) return "Peso deve ser múltiplo de 0,5";
  });

  const [minutesProps] = useFormValidation(set.time.minutes, n => {
    if (n < 0) return "Minutos deve ser maior ou igual a 0";
    if (n % 1 !== 0) return "Minutos deve ser inteiro";
  });

  const [secondsProps] = useFormValidation(set.time.seconds, n => {
    if (n < 0) return "Segundos deve ser maior ou igual a 0";
    if (n % 1 !== 0) return "Segundos deve ser inteiro";
  });

  return (
    <div
      className="m-0.5 flex w-full items-center justify-between rounded border-1 bg-white p-1.5 shadow-md"
      key={index}
    >
      <div className="flex grow flex-row gap-1">
        {exercise.type === "REPS" ? (
          <div className="flex grow flex-col gap-1">
            <NumberInput
              label="Repetições"
              className="w-full bg-white"
              value={set.reps}
              onChange={n =>
                actions.setSetReps(exercise.id, index, n)
              }
              min={0}
              max={100}
              disabled={disabled}
              {...repsProps}
            />
            {repsProps.error && <span className="text-xs text-red-500">{repsProps.error}</span>}
          </div>
        ) : (
          <>
            <div className="flex grow flex-col gap-1">
              <NumberInput
                label="Minutos"
                className="w-full bg-white"
                value={set.time.minutes}
                onChange={n =>
                  actions.setSetTime(exercise.id, index, { ...set.time, minutes: n })
                }
                min={0}
                max={1000}
                disabled={disabled}
                {...minutesProps}
              />
              {minutesProps.error && (
                <span className="text-xs text-red-500">{minutesProps.error}</span>
              )}
            </div>
            <div className="flex grow flex-col gap-1">
              <NumberInput
                label="Segundos"
                className="w-full bg-white"
                value={set.time.seconds}
                onChange={n =>
                  actions.setSetTime(exercise.id, index, { ...set.time, seconds: n })
                }
                min={0}
                max={59}
                disabled={disabled}
                {...secondsProps}
              />
              {secondsProps.error && (
                <span className="text-xs text-red-500">{secondsProps.error}</span>
              )}
            </div>
          </>
        )}
        <div className="flex h-full grow flex-col gap-1">
          <NumberInput
            label="Peso (kg)"
            className="w-full bg-white"
            value={set.weight}
            onChange={n =>
              actions.setSetWeight(exercise.id, index, n)
            }
            min={0}
            step={0.5}
            max={1000}
            disabled={disabled}
            {...weightProps}
          />
          {weightProps.error && <span className="text-xs text-red-500">{weightProps.error}</span>}
        </div>
      </div>
      {exercise.sets.length !== 1 && (
        <div className="ml-1 flex items-center">
          <button
            className="rounded-full border-1 border-gray-300 p-1 text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              actions.removeSet(exercise.id, index)
            }
            disabled={disabled}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
