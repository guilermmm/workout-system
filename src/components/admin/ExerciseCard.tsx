import { Method } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { classList, useFormValidation } from "../../utils";
import { api, type RouterOutputs } from "../../utils/api";
import { methodTranslation } from "../../utils/consts";
import type { Exercise, Set, WorkoutActions } from "../../utils/workout";
import Dropdown from "../Dropdown";
import Modal from "../Modal";
import NumberInput from "../NumberInput";
import Select from "../Select";
import Spinner from "../Spinner";
import TextArea from "../TextArea";
import TextInput from "../TextInput";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronUpIcon from "../icons/ChevronUpIcon";
import PhotoIcon from "../icons/PhotoIcon";
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

  const exerciseExercise = categories
    .flatMap(group => group.exercises)
    .find(e => e.id === exercise.exerciseId);

  const [showImageModal, setShowImageModal] = useState(false);

  const selectedExerciseImage = api.exercise.getExerciseImageById.useQuery(
    { id: exerciseExercise?.id ?? "" },
    { enabled: !!showImageModal },
  );

  const isCollapsed = collapsed || exercise.hidden;

  return (
    <div className="relative m-2 flex flex-col justify-between rounded-lg bg-white p-2 shadow-md">
      {showImageModal && exerciseExercise && (
        <Modal
          onClickOutside={() => setShowImageModal(false)}
          buttons={
            <button
              onClick={() => setShowImageModal(false)}
              className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fechar
            </button>
          }
        >
          <h1 className="self-center font-medium">{exerciseExercise.name}</h1>
          {selectedExerciseImage.isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner className="m-16 h-24 w-24 fill-blue-600 text-gray-200" />
            </div>
          ) : selectedExerciseImage.data ? (
            <div className="relative h-72 w-72">
              <Image
                src={selectedExerciseImage.data}
                className="h-full w-full rounded-md object-cover"
                alt={exerciseExercise.name}
                fill
              />
            </div>
          ) : (
            <h2>Não há imagem para {exerciseExercise.name}.</h2>
          )}
        </Modal>
      )}
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
                <div className="flex grow-2 flex-row gap-2">
                  <Select
                    className="min-h-[3rem] grow rounded-lg bg-white font-medium sm:w-1/2"
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
                  {exercise.exerciseId && (
                    <button onClick={() => setShowImageModal(true)} className="px-2">
                      <PhotoIcon className="h-6 w-6 text-black" />
                    </button>
                  )}
                </div>
                <div className="flex grow flex-row">
                  <Select
                    className="min-h-[3rem] grow rounded-lg bg-white font-medium sm:w-1/2"
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
              </div>
              <TextArea
                className="h-full w-full rounded-lg bg-white"
                label="Observação"
                value={exercise.description ?? ""}
                onChange={d => actions.setExerciseDescription(exercise.id, d)}
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
                    onChange={e =>
                      actions.setExerciseType(exercise.id, e.target.checked ? "TIME" : "REPS")
                    }
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

const SetCard = ({ exercise, set, index, actions, disabled }: SetProps) => {
  const [repsProps] = useFormValidation(set.reps, n => {
    if (n.trim() === "") return "Repetições não pode ser vazio";
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
            <RepsInput
              label="Repetições"
              className="w-full bg-white"
              value={set.reps}
              onChange={r => actions.setSetReps(exercise.id, index, r)}
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
                onChange={n => actions.setSetTime(exercise.id, index, { ...set.time, minutes: n })}
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
                onChange={n => actions.setSetTime(exercise.id, index, { ...set.time, seconds: n })}
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
          <TextInput
            label="Peso"
            className="w-full bg-white"
            value={set.weight}
            onChange={w => actions.setSetWeight(exercise.id, index, w)}
            disabled={disabled}
          />
        </div>
      </div>
      {exercise.sets.length !== 1 && (
        <div className="ml-1 flex items-center">
          <button
            className="rounded-full border-1 border-gray-300 p-1 text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => actions.removeSet(exercise.id, index)}
            disabled={disabled}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

type InputProps = {
  label: string;
  type?: "text" | "password";
  name?: string;
  className?: string;
  model?: "outline" | "floor";
  error?: string;
  value: string;
  onChange: (e: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
};

const RepsInput: React.FC<InputProps> = ({
  value,
  name,
  onChange,
  label,
  className,
  model = "outline",
  error,
  ...props
}) => {
  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <input
          type="text"
          name={name}
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2 pb-1 pt-1.5 text-sm text-gray-900 outline-none ring-0 transition-none duration-300 invalid:border-red-500 invalid:text-red-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&:not(:invalid):focus]:border-blue-600",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
              "border-red-500 text-red-500": error !== undefined,
            },
          )}
          placeholder=" "
          value={value}
          onChange={e => onChange(e.target.value)}
          {...props}
        />
        <label
          className={classList(
            "pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform cursor-text whitespace-nowrap bg-inherit px-2 text-sm duration-300",
            "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
            {
              "text-red-500": error !== undefined,
              "text-gray-500": error === undefined,
            },
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default ExerciseCard;
