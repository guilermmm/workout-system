import { Weekday } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Alert from "../../../components/Alert";
import FullPage from "../../../components/FullPage";
import MultiSelect from "../../../components/MultiSelect";
import ProfilePic from "../../../components/ProfilePic";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import Sortable from "../../../components/SortableList";
import Spinner from "../../../components/Spinner";
import TextInput from "../../../components/TextInput";
import BiSetCard from "../../../components/admin/BiSetCard";
import ExerciseCard from "../../../components/admin/ExerciseCard";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import Bars2Icon from "../../../components/icons/Bars2Icon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import ExclamationTriangleIcon from "../../../components/icons/ExclamationTriangleIcon";
import PlusIcon from "../../../components/icons/PlusIcon";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import { weekdaysTranslation } from "../../../utils/consts";
import { useStoredWorkout } from "../../../utils/workout";

const dragHandle = (
  <Sortable.DragHandle className="rounded-full bg-white p-2 text-gray-400 shadow-md transition-colors hover:bg-gray-300 hover:text-white">
    <Bars2Icon className="h-6 w-6" />
  </Sortable.DragHandle>
);

const CreateWorkout = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId, { refetchOnWindowFocus: false });
  const categories = api.exercise.getGroups.useQuery(undefined, { refetchOnWindowFocus: false });

  const updateWorkoutDate = api.user.updateWorkoutDate.useMutation();

  const createWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      updateWorkoutDate.mutate({ profileId });
    },
  });

  const [isConfirmationAlertOpen, setConfirmationAlertOpen] = useState(false);

  const [{ workout, groups }, actions, resetWorkout] = useStoredWorkout("create-workout");

  const saving = createWorkout.isLoading;

  const handleSave = () => {
    createWorkout.mutate(
      {
        name: workout.name,
        days: workout.days,
        profileId,
        exercises: workout.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          description: exercise.description,
          method: exercise.method,
          sets:
            exercise.type === "REPS"
              ? exercise.sets.map(({ reps, weight }) => ({
                  reps,
                  weight: weight * 1000,
                }))
              : exercise.sets.map(({ time, weight }) => ({
                  time: time.minutes * 60 + time.seconds,
                  weight: weight * 1000,
                })),
          index,
        })),
        biSets: workout.biSets.map(([firstId, secondId]) => {
          const first = workout.exercises.findIndex(e => e.id === firstId)!;
          const second = workout.exercises.findIndex(e => e.id === secondId)!;
          return [first, second];
        }),
      },
      {
        onSuccess: () => {
          setConfirmationAlertOpen(false);
          resetWorkout();
          router.back();
        },
      },
    );
  };

  const handleChangeGroups = (newGroups: typeof groups) => {
    const newExercises = newGroups.flatMap(g => ("exercises" in g ? g.exercises : g));

    actions.setExercises(newExercises);
  };

  const canSubmit =
    workout.name !== "" &&
    workout.days.length > 0 &&
    workout.exercises.length > 0 &&
    workout.exercises.every(
      e =>
        e.exerciseId !== "" &&
        ((e.type === "REPS" && e.sets.every(s => s.reps > 0)) ||
          (e.type === "TIME" && e.sets.every(s => s.time.seconds > 0 || s.time.minutes > 0))),
    );

  return (
    <FullPage>
      <QueryErrorAlert queries={[profile, categories]} />
      {createWorkout.error && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não foi possível criar o treino"
          text="Não foi possível buscar os dados necessários para acessar esta página, verifique sua conexão e tente novamente"
          onClickOutside={() => createWorkout.reset()}
        >
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={createWorkout.reset}
          >
            OK
          </button>
        </Alert>
      )}
      {isConfirmationAlertOpen && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-700" />
          }
          title="Criar treino"
          text={`Tem certeza que deseja salvar o treino ${workout.name} criado para ${
            profile.data!.user?.name ?? profile.data!.email
          }?`}
          onClickOutside={() => setConfirmationAlertOpen(false)}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSubmit || saving}
          >
            {saving ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Salvar treino"
            )}
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setConfirmationAlertOpen(false)}
          >
            Cancelar
          </button>
        </Alert>
      )}
      <div className="flex flex-row items-center justify-between bg-gold-500 p-2">
        <div className="flex flex-row items-center justify-between">
          <button
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => router.back()}
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center">
          <div className="flex max-w-[calc(100vw_-_144px)] flex-row items-center justify-between text-right">
            <div className="ml-4 flex flex-col truncate">
              {profile.data && (
                <>
                  <h1 className="truncate text-xl text-blue-700">
                    Criar treino para <span className="font-bold">{profile.data.user?.name}</span>
                  </h1>
                  <p className="truncate font-medium text-slate-700">{profile.data.email}</p>
                </>
              )}
            </div>
          </div>
          <div className="ml-4">
            {profile.isLoading ? (
              <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
            ) : (
              profile.data && <ProfilePic size="md" user={profile.data.user} />
            )}
          </div>
        </div>
      </div>

      <div className="flex grow flex-col items-center overflow-y-auto">
        <div className="flex w-full flex-col gap-2 bg-white py-4 px-2 sm:flex-row">
          <TextInput
            label="Nome do treino"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            value={workout.name}
            onChange={actions.setName}
          />
          <MultiSelect
            label="Dia(s)"
            className="min-h-[3rem] w-full rounded-lg bg-white font-medium sm:w-1/2"
            options={Object.values(Weekday)}
            onChange={actions.setDays}
            selected={workout.days}
            itemToString={it => weekdaysTranslation[it]}
            itemToKey={it => it}
            disabled={saving}
          />
        </div>
        {categories.isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner className="h-12 w-12 fill-blue-600 text-gray-50" />
          </div>
        ) : (
          categories.data && (
            <Sortable.List
              className="w-full max-w-[48rem]"
              items={groups}
              onChange={handleChangeGroups}
            >
              {(group, animating) => (
                <Sortable.Item className="" id={group.id}>
                  {(() => {
                    if ("exercises" in group) {
                      const [a, b] = group.exercises;

                      return (
                        <BiSetCard
                          first={a}
                          second={b}
                          actions={actions}
                          categories={categories.data}
                          dragHandle={dragHandle}
                          collapsed={animating}
                          disabled={saving}
                        />
                      );
                    }

                    const exercise = group;
                    return (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        actions={actions}
                        categories={categories.data}
                        otherExercises={workout.exercises.filter(
                          other =>
                            other.id !== exercise.id &&
                            other.exerciseId !== "" &&
                            workout.biSets.every(
                              ([first, second]) => first !== other.id && second !== other.id,
                            ),
                        )}
                        dragHandle={dragHandle}
                        collapsed={animating}
                        disabled={saving}
                      />
                    );
                  })()}
                </Sortable.Item>
              )}
            </Sortable.List>
          )
        )}
        {categories.data && (
          <div className="mb-20 flex flex-row items-center justify-center">
            <button
              className="mt-2 flex items-center gap-3 rounded-full bg-blue-500 px-6 py-2 font-medium text-white shadow-md hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
              onClick={actions.addExercise}
            >
              Adicionar exercício
              <PlusIcon className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>
      {profile.data && categories.data && (
        <div className="fixed bottom-0 right-0 p-4">
          <button
            className="flex items-center gap-3 rounded-full bg-green-500 px-6 py-2 font-medium text-white shadow-sm hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500"
            onClick={() => setConfirmationAlertOpen(true)}
            disabled={!canSubmit || saving}
          >
            {saving ? "Salvando..." : "Salvar treino"}
            {saving ? (
              <Spinner className="h-8 w-8 fill-blue-600 text-gray-200" />
            ) : (
              canSubmit && <CheckCircleIcon className="h-8 w-8" />
            )}
          </button>
        </div>
      )}
    </FullPage>
  );
};

export default CreateWorkout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
