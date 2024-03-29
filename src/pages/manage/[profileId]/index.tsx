import { Menu } from "@headlessui/react";
import type { Profile, User } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import Alert from "../../../components/Alert";
import DatePicker from "../../../components/DatePicker";
import DownloadPDFButton from "../../../components/DownloadPDFButton";
import FullPage from "../../../components/FullPage";
import Modal from "../../../components/Modal";
import ProfilePic from "../../../components/ProfilePic";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import Spinner from "../../../components/Spinner";
import TextInput from "../../../components/TextInput";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import CheckIcon from "../../../components/icons/CheckIcon";
import ExclamationCircleIcon from "../../../components/icons/ExclamationCircleIcon";
import MagnifyingGlassIcon from "../../../components/icons/MagnifyingGlassIcon";
import PencilSquareIcon from "../../../components/icons/PencilSquareIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import { getServerAuthSession } from "../../../server/auth";
import {
  capitalize,
  classList,
  getAge,
  join,
  useEndOfScroll,
  useFormValidation,
  validateEmail,
} from "../../../utils";
import type { RouterOutputs } from "../../../utils/api";
import { api } from "../../../utils/api";
import WorkoutDocument from "../../../utils/pdf";
import { weekdaysAbbrv } from "../../../utils/consts";

type Workout = RouterOutputs["workout"]["getMany"][number];

const Manage = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId, {
    onSuccess: data => {
      setEmail(data.email);
      setBirthdate(data.birthdate);

      if (data.user !== null) setUser({ ...user, name: data.user.name ?? "" });
    },
  });

  const workouts = api.workout.getMany.useQuery(
    { profileId },
    {
      onSuccess: () => {
        void workoutsWithExercises.refetch();
      },
    },
  );

  const workoutsWithExercises = api.workout.getManyWithExercises.useQuery(
    { profileId },
    { enabled: false },
  );

  const changeStatus = (
    profile.data?.isActive ? api.user.deactivate.useMutation : api.user.activate.useMutation
  )({
    onSuccess: () => {
      void profile.refetch();
      setShowMutateAlert(false);
    },
  });

  const [showMutateAlert, setShowMutateAlert] = useState(false);

  const [showMutateProfileConfirmAlert, setShowMutateProfileConfirmAlert] = useState(false);
  const [showMutateProfileModal, setShowMutateProfileModal] = useState(false);
  const [showMutateProfileDeleteAlert, setShowMutateProfileDeleteAlert] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showMutatePasswordAlert, setShowMutatePasswordAlert] = useState(false);
  const [showMutateProfileErrorAlert, setShowMutateProfileErrorAlert] = useState(false);
  const [showMutateSaveWorkoutAlert, setShowMutateSaveWorkoutAlert] = useState(false);

  const [email, setEmail] = useState(profile.data?.email ?? "");
  const [birthdate, setBirthdate] = useState<Date | null>(profile.data?.birthdate ?? null);

  const [emailProps, { resetError: resetEmailError }] = useFormValidation(
    email,
    v => {
      if (!validateEmail(v)) {
        return "E-mail inválido";
      }
    },
    false,
  );

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void profile.refetch();
      setShowMutateProfileConfirmAlert(false);
      setShowMutateProfileModal(false);
    },
    onError: e => {
      if (e.data?.code === "FORBIDDEN") {
        setShowMutateProfileConfirmAlert(false);
        setShowMutateProfileErrorAlert(true);
      }
    },
  });

  const deleteProfile = api.user.deleteProfile.useMutation({
    onSuccess: () => {
      void router.push("/dashboard");
    },
  });

  const [toRemove, setToRemove] = useState<Workout | null>(null);

  const deleteWorkout = api.workout.delete.useMutation({
    onSuccess: () => {
      setToRemove(null);
      void workouts.refetch();
    },
  });

  const [user, setUser] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    image: "" as string | null,
  });

  const createUser = api.user.createUser.useMutation({
    onSuccess: () => {
      setUser({
        name: "",
        password: "",
        confirmPassword: "",
        image: "",
      });
      void profile.refetch();
    },
  });

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const [passwordProps, { error: passwordError, resetError: resetPasswordError }] =
    useFormValidation(
      user.password,
      v => {
        if (v.length < 6) {
          return "Senha deve ter no mínimo 6 caracteres";
        }
      },
      false,
    );

  const updatePassword = api.user.updateUserPassword.useMutation({
    onSuccess: () => {
      setShowMutatePasswordAlert(false);
      setShowChangePasswordModal(false);
      setUser({ ...user, password: "", confirmPassword: "" });
    },
  });

  const [
    confirmPasswordProps,
    { error: confirmPasswordError, resetError: resetConfirmPasswordError },
  ] = useFormValidation(
    user.confirmPassword,
    v => {
      if (v !== user.password) {
        return "Senhas não coincidem";
      }
    },
    false,
  );

  const resetInputs = () => {
    resetEmailError();
    resetPasswordError();
    resetConfirmPasswordError();

    setEmail(profile.data?.email ?? "");
    setBirthdate(profile.data?.birthdate ?? null);
    setUser({
      name: profile.data?.user?.name ?? "",
      password: "",
      confirmPassword: "",
      image: "" as string | null,
    });
  };

  const [showCopyWorkoutModal, setShowCopyWorkoutModal] = useState(false);
  const [showCopyWorkoutErrorAlert, setShowCopyWorkoutErrorAlert] = useState(false);

  const updateWorkoutDate = api.user.updateWorkoutDate.useMutation();

  const createWorkout = api.workout.create.useMutation();

  const saveWorkout = api.workout.save.useMutation({
    onSuccess: () => {
      setShowMutateSaveWorkoutAlert(false);
    },
  });

  const createWorkouts = (ws: RouterOutputs["workout"]["getManyWithExercises"]) => {
    Promise.all(
      ws.map(w =>
        createWorkout.mutateAsync({
          profileId: profile.data!.id,
          biSets: w.biSets.map(([left, right]) => [
            w.exercises.findIndex(e => e.id === left)!,
            w.exercises.findIndex(e => e.id === right)!,
          ]),
          exercises: w.exercises,
          days: w.days,
          name: w.name,
        }),
      ),
    )
      .catch(() => setShowCopyWorkoutErrorAlert(true))
      .finally(() => {
        updateWorkoutDate.mutate({ profileId });
        setShowCopyWorkoutModal(false);
        void workouts.refetch();
      });
  };

  return (
    <FullPage>
      <QueryErrorAlert queries={[profile, workouts]} />
      {profile.data && showMutateAlert && (
        <Alert
          icon={
            <ExclamationCircleIcon
              className={classList("h-10 w-10 rounded-full p-2", {
                "bg-red-200 text-red-500": profile.data.isActive,
                "bg-green-200 text-green-500": !profile.data.isActive,
              })}
            />
          }
          title={profile.data?.isActive ? "Desativar usuário" : "Ativar usuário"}
          footer={
            <>
              <button
                className={classList(
                  "rounded-md border-1 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50",
                  {
                    "border-green-600 bg-green-600": !profile.data.isActive,
                    "border-red-600 bg-red-600": profile.data.isActive,
                  },
                )}
                onClick={() => changeStatus.mutate({ profileId: profile.data.id })}
                disabled={changeStatus.isLoading}
              >
                {changeStatus.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
                  </div>
                ) : (
                  "Confirmar"
                )}
              </button>
              {!changeStatus.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowMutateAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setShowMutateAlert(false)}
        >
          {`Tem certeza que deseja ${profile.data.isActive ? "desativar" : "ativar"} o usuário ${
            profile.data.user?.name ?? profile.data.email
          }?`}
        </Alert>
      )}
      {profile.data && toRemove && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-200 p-2 text-red-500" />}
          title="Excluir treino"
          footer={
            <>
              <button
                className="rounded-md border-1 border-red-600 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => deleteWorkout.mutate({ id: toRemove.id })}
                disabled={deleteWorkout.isLoading}
              >
                {deleteWorkout.isLoading ? (
                  <Spinner className="h-6 w-6 fill-red-600 text-gray-200" />
                ) : (
                  "Confirmar"
                )}
              </button>
              {!deleteWorkout.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setToRemove(null)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setToRemove(null)}
        >
          {`Tem certeza que deseja excluir o treino ${toRemove.name} do usuário ${
            profile.data.user?.name ?? profile.data.email
          }?`}
        </Alert>
      )}
      {showMutateProfileModal && (
        <Modal
          onClickOutside={() => {
            setShowMutateProfileModal(false);
            resetInputs();
          }}
          buttons={
            <>
              <button
                onClick={() => setShowMutateProfileConfirmAlert(true)}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!validateEmail(email)}
              >
                Atualizar
              </button>

              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => {
                  setShowMutateProfileModal(false);
                  resetInputs();
                }}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="max-w-full self-center truncate whitespace-pre-wrap font-medium">
            Atualizar usuário {profile.data?.user?.name ?? profile.data?.email}
          </h1>
          {profile.data?.user !== null && profile.data?.user.credentialsId && (
            <TextInput
              label="Nome"
              className="rounded-md bg-slate-50"
              value={user.name}
              onChange={v => setUser({ ...user, name: v })}
            />
          )}
          <TextInput
            label="Email"
            className="rounded-md bg-slate-50"
            value={email}
            onChange={v => setEmail(v.toLowerCase())}
            {...emailProps}
          />
          {emailProps.error && <span className="text-xs text-red-500">{emailProps.error}</span>}
          <DatePicker
            label="Data de nascimento"
            className="rounded-md bg-slate-50"
            value={birthdate}
            onChange={setBirthdate}
          />
        </Modal>
      )}
      {showMutateProfileConfirmAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Confirmar Atualização"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  updateProfile.mutate({ id: profileId, email, birthdate, name: user.name });
                }}
              >
                {updateProfile.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
                  </div>
                ) : (
                  "Confirmar"
                )}
              </button>
              {!updateProfile.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowMutateProfileConfirmAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setShowMutateProfileConfirmAlert(false)}
        >
          Tem certeza que deseja realizar essas alterações?
        </Alert>
      )}
      {showCreateUserModal && (
        <Modal
          onClickOutside={() => setShowCreateUserModal(false)}
          buttons={
            <>
              <button
                onClick={() => {
                  if (
                    !user.name ||
                    !user.password ||
                    !user.confirmPassword ||
                    passwordError() ||
                    confirmPasswordError()
                  )
                    return;
                  createUser.mutate({
                    ...user,
                    profileId,
                  });
                  setShowCreateUserModal(false);
                }}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !user.name ||
                  !user.password ||
                  !user.confirmPassword ||
                  !!passwordProps.error ||
                  !!confirmPasswordProps.error
                }
              >
                Cadastrar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => setShowCreateUserModal(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="max-w-full self-center truncate whitespace-pre-wrap font-medium">
            Cadastrar dados de acesso
          </h1>
          <TextInput
            label="Nome"
            className="rounded-md bg-slate-50"
            value={user.name}
            onChange={v => setUser({ ...user, name: v })}
          />
          <TextInput
            label="Email"
            className="rounded-md bg-slate-50"
            value={profile.data?.email ?? ""}
            onChange={() => null}
            disabled
          />
          <TextInput
            label="Senha"
            className="rounded-md bg-slate-50"
            value={user.password}
            onChange={v => setUser({ ...user, password: v })}
            type="password"
            {...passwordProps}
          />
          {passwordProps.error && (
            <span className="text-xs text-red-500">{passwordProps.error}</span>
          )}
          <TextInput
            label="Confirmar senha"
            className="rounded-md bg-slate-50"
            value={user.confirmPassword}
            onChange={v => setUser({ ...user, confirmPassword: v })}
            type="password"
            {...confirmPasswordProps}
          />
          {confirmPasswordProps.error && (
            <span className="text-xs text-red-500">{confirmPasswordProps.error}</span>
          )}
        </Modal>
      )}
      {showMutateProfileDeleteAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-600" />}
          title="Confirmar Exclusão"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  deleteProfile.mutate(profileId);
                }}
              >
                {deleteProfile.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
                  </div>
                ) : (
                  "Excluir"
                )}
              </button>
              {!deleteProfile.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowMutateProfileDeleteAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setShowMutateProfileDeleteAlert(false)}
        >
          {`Tem certeza que deseja excluir o usuário ${
            profile.data?.user?.name ?? profile.data!.email
          }? Todos os dados serão perdidos.`}
        </Alert>
      )}
      {showChangePasswordModal && (
        <Modal
          onClickOutside={() => {
            resetInputs();
            setShowChangePasswordModal(false);
          }}
          buttons={
            <>
              <button
                onClick={() => {
                  setShowMutatePasswordAlert(true);
                }}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !user.password ||
                  !user.confirmPassword ||
                  !!passwordProps.error ||
                  !!confirmPasswordProps.error
                }
              >
                Atualizar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  resetInputs();
                }}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="max-w-full self-center truncate whitespace-pre-wrap font-medium">
            Atualizar senha do usuário
          </h1>

          <TextInput
            label="Nova senha"
            className="rounded-md bg-slate-50"
            value={user.password}
            onChange={v => setUser({ ...user, password: v })}
            type="password"
            {...passwordProps}
          />
          {passwordProps.error && (
            <span className="text-xs text-red-500">{passwordProps.error}</span>
          )}
          <TextInput
            label="Confirmar nova senha"
            className="rounded-md bg-slate-50"
            value={user.confirmPassword}
            onChange={v => setUser({ ...user, confirmPassword: v })}
            type="password"
            {...confirmPasswordProps}
          />
          {confirmPasswordProps.error && (
            <span className="text-xs text-red-500">{confirmPasswordProps.error}</span>
          )}
        </Modal>
      )}
      {showMutatePasswordAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Confirmar Atualização"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  if (
                    !user.password ||
                    !user.confirmPassword ||
                    passwordError() ||
                    confirmPasswordError()
                  )
                    return;

                  updatePassword.mutate({
                    userId: profile.data?.userId ?? "",
                    newPassword: user.password,
                  });
                }}
              >
                {updateProfile.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
                  </div>
                ) : (
                  "Confirmar"
                )}
              </button>
              {!updateProfile.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowMutatePasswordAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setShowMutatePasswordAlert(false)}
        >
          Tem certeza que deseja alterar a senha do usuário?
        </Alert>
      )}
      {showMutateProfileErrorAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-600" />}
          title="Erro ao atualizar"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  setShowMutateProfileErrorAlert(false);
                }}
              >
                Ok
              </button>
            </>
          }
          onClickOutside={() => setShowMutateProfileErrorAlert(false)}
        >
          O e-mail inserido já está em uso.
        </Alert>
      )}
      {showCopyWorkoutModal && (
        <Modal
          onClickOutside={() => setShowCopyWorkoutModal(false)}
          buttons={
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowCopyWorkoutModal(false)}
            >
              Cancelar
            </button>
          }
        >
          <CopyWorkout onChoose={createWorkouts} />
        </Modal>
      )}
      {showCopyWorkoutErrorAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-600" />}
          title="Erro ao copiar treino"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  setShowCopyWorkoutErrorAlert(false);
                }}
              >
                Ok
              </button>
            </>
          }
          onClickOutside={() => setShowCopyWorkoutErrorAlert(false)}
        >
          Ocorreu um erro ao copiar o treino, tente novamente em instantes.
        </Alert>
      )}
      {showMutateSaveWorkoutAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Arquivar treino"
          footer={
            <>
              <button
                className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  saveWorkout.mutate({
                    profileId,
                    workouts: workoutsWithExercises.data!.map(workout => workout.id),
                  });
                }}
              >
                {saveWorkout.isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
                  </div>
                ) : (
                  "Confirmar"
                )}
              </button>
              {!saveWorkout.isLoading && (
                <button
                  className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                  onClick={() => setShowMutateSaveWorkoutAlert(false)}
                >
                  Cancelar
                </button>
              )}
            </>
          }
          onClickOutside={() => setShowMutateSaveWorkoutAlert(false)}
        >
          Tem certeza que deseja arquivar o treino atual?
        </Alert>
      )}
      <div className="relative flex h-full flex-col overflow-y-auto">
        <div className="relative flex w-full flex-row items-start justify-between bg-slate-100 p-2">
          <div className="absolute left-0 top-0 right-0 h-20 bg-gold-500" />
          <Link
            href="/dashboard"
            className="z-10 rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </Link>
          <div className="flex w-full flex-col items-center justify-center truncate pt-4">
            <div className="z-10 rounded-full bg-slate-100 p-2">
              {profile.data ? (
                <ProfilePic size="xl" user={profile.data?.user} />
              ) : (
                <Spinner className="h-24 w-24 fill-blue-600 text-gray-200" />
              )}
            </div>
            {profile.isLoading && <div className="h-12" />}
          </div>
          <div className="p-5">
            <div className="h-6 w-6" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          {profile.data && (
            <div className="flex min-w-0 max-w-full flex-col items-center justify-center">
              <h1 className="my-1 w-full self-start truncate text-center text-lg font-medium text-slate-900">
                <span className="font-bold">{profile.data.user?.name ?? profile.data.email}</span>
              </h1>
              {profile.data.birthdate && (
                <h1 className="my-1 w-full self-start truncate text-center text-lg font-medium text-slate-900">
                  <span>
                    {`${getAge(
                      profile.data.birthdate,
                    )} anos - ${profile.data.birthdate.toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}`}
                  </span>
                </h1>
              )}

              <button
                onClick={() => setShowMutateAlert(true)}
                className={classList(
                  "mb-2 rounded-md px-4 py-1 text-sm font-medium text-white",
                  profile.data.isActive ? "bg-green-500" : "bg-red-500",
                )}
              >
                {profile.data.isActive ? "Ativo" : "Inativo"}
              </button>
            </div>
          )}
          {profile.data?.user === null && (
            <div className="flex w-full max-w-[32rem] flex-row justify-center gap-2 px-2">
              <button
                className="w-full rounded-md bg-gold-400 p-2 py-3 text-center text-sm text-slate-900 shadow-md transition-colors hover:bg-gold-500"
                onClick={() => setShowCreateUserModal(true)}
              >
                Cadastrar dados de acesso
              </button>
            </div>
          )}
          <div className="flex w-full max-w-[32rem] flex-row justify-center gap-2 px-2">
            <Link
              className="w-full rounded-md bg-blue-500 p-2 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
              href={`/manage/${profileId}/workout_history`}
            >
              Histórico de treinos
            </Link>
            <Link
              href={`/manage/${profileId}/datasheet_history`}
              className="w-full rounded-md bg-blue-500 p-2 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
            >
              Histórico de medidas
            </Link>
          </div>
        </div>
        <div className="flex h-full grow flex-col items-center">
          {workouts.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="h-32 w-32 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            workouts.data && (
              <div className="mt-4 flex w-full max-w-[32rem] flex-col items-center gap-2 px-2 pb-4">
                <div>
                  <h2 className="text-lg font-medium">Treinos</h2>
                  <div className="h-1 w-full bg-gold-500" />
                </div>
                {profile.data?.workoutUpdateDate && (
                  <h3 className="text-md pt-2 font-light text-slate-600">
                    Última atualização:{" "}
                    {profile.data?.workoutUpdateDate?.toLocaleDateString("pt-BR")}
                  </h3>
                )}
                {workouts.data.map(workout => (
                  <div
                    className="flex w-full flex-1 justify-between rounded-md bg-blue-500 text-slate-100 shadow-md"
                    key={workout.id}
                  >
                    <Link
                      href={`/manage/${profileId}/edit_workout/${workout.id}`}
                      className="flex h-full grow items-center justify-center rounded-l-md p-4 pl-6 transition-colors hover:bg-blue-600"
                    >
                      <div className="grow">
                        <div className="text-xl">
                          Treino{" "}
                          <span className="font-medium">
                            {workout.name} -{" "}
                            {workout.days
                              .map(day => capitalize(weekdaysAbbrv[day].toLowerCase()))
                              .join(", ")}
                          </span>
                        </div>
                        <div className="text-sm font-light opacity-90">
                          {capitalize(join(workout.categories))}
                        </div>
                      </div>
                      <div className="pr-2 text-gold-400">
                        <PencilSquareIcon className="h-6 w-6 text-gold-400" />
                      </div>
                    </Link>
                    <div className="relative flex items-center justify-center rounded-r-md bg-blue-400 p-3 transition-colors hover:bg-blue-500">
                      <button
                        onClick={() => setToRemove(workout)}
                        className="rounded-full bg-blue-200 p-2 text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex w-full max-w-[32rem] flex-col justify-center gap-2 sm:flex-row">
                  <Menu as="div" className="relative w-full">
                    <Menu.Button className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600">
                      Adicionar treino
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 flex origin-top-right flex-col gap-2 rounded-md bg-white p-2 shadow-lg">
                      <Menu.Item
                        as={Link}
                        href={`/manage/${profileId}/create_workout`}
                        className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                      >
                        Criar treino novo
                      </Menu.Item>
                      <Menu.Item
                        as="button"
                        className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                        onClick={() => setShowCopyWorkoutModal(true)}
                      >
                        Copiar treino existente
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                  {workoutsWithExercises.isLoading ? (
                    <div className="w-full rounded-md bg-slate-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors ">
                      Gerando pdf...
                    </div>
                  ) : (
                    <DownloadPDFButton
                      fileName={`Treinos - ${
                        profile.data?.user?.name ?? profile.data?.email ?? ""
                      }`}
                      document={
                        <WorkoutDocument
                          profile={profile.data!}
                          workouts={workoutsWithExercises.data!}
                        />
                      }
                      className="w-full rounded-md bg-blue-500 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                    >
                      <span className="px-6">Baixar Treinos</span>
                    </DownloadPDFButton>
                  )}
                </div>
                <div className="flex w-full max-w-[32rem] flex-col justify-center gap-2 sm:flex-row">
                  <Link
                    href={`/manage/${profileId}/workout_program`}
                    className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    Treinos arquivados
                  </Link>
                  <button
                    onClick={() => setShowMutateSaveWorkoutAlert(true)}
                    className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    Arquivar treino
                  </button>
                </div>
                <div className="flex w-full max-w-[32rem] flex-col justify-center gap-2 sm:flex-row">
                  <button
                    onClick={() => setShowMutateProfileModal(true)}
                    className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    Atualizar perfil
                  </button>
                  {profile.data?.user !== null && profile.data?.user.credentialsId && (
                    <button
                      onClick={() => setShowChangePasswordModal(true)}
                      className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                    >
                      Trocar senha
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowMutateProfileDeleteAlert(true)}
                  className="w-full rounded-md bg-red-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-red-600"
                >
                  Excluir perfil
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </FullPage>
  );
};

type CopyWorkoutProps = {
  onChoose: (workout: RouterOutputs["workout"]["getManyWithExercises"]) => void;
};

const CopyWorkout = ({ onChoose }: CopyWorkoutProps) => {
  const [searchInput, setSearchInput] = useState("");

  const [debouncedInput] = useDebounce(searchInput, 150);

  const profiles = api.user.searchProfiles.useInfiniteQuery(
    { search: debouncedInput },
    { getNextPageParam: lastPage => lastPage.nextCursor },
  );

  const ref = useEndOfScroll<HTMLDivElement>(() => {
    if (profiles.hasNextPage && !profiles.isFetching) {
      void profiles.fetchNextPage();
    }
  });

  const [chosenUser, setChosenUser] = useState<(Profile & { user: User | null }) | null>(null);

  const workouts = api.workout.getManyWithExercises.useQuery(
    { profileId: chosenUser?.id ?? "" },
    { enabled: chosenUser !== null },
  );

  const [chosenWorkouts, setChosenWorkouts] = useState<
    RouterOutputs["workout"]["getManyWithExercises"]
  >([]);

  const chooseUser = (profile: Profile & { user: User | null }) => {
    setChosenUser(profile);
    setSearchInput("");
  };

  const toggleWorkout = (workout: RouterOutputs["workout"]["getManyWithExercises"][number]) => {
    if (chosenWorkouts.some(w => w.id === workout.id)) {
      setChosenWorkouts(chosenWorkouts.filter(w => w.id !== workout.id));
    } else {
      setChosenWorkouts([...chosenWorkouts, workout]);
    }
  };

  return (
    <div className="relative flex max-h-96 w-80 flex-col">
      {chosenUser ? (
        <>
          <div className="relative m-2 flex items-center gap-2">
            <button className="rounded-full p-2" onClick={() => setChosenUser(null)}>
              <ArrowUturnLeftIcon className="h-5 w-5" />
            </button>
            <ProfilePic user={chosenUser.user} size="sm" />
            <span className="text-sm font-semibold">
              {chosenUser.user?.name ?? chosenUser.email}
            </span>
          </div>
          <div className="grow overflow-y-auto">
            <div className="flex h-full flex-1 grow flex-col items-center gap-4">
              {!workouts.data && workouts.isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Spinner className="fill-blue-600 text-gray-200" />
                </div>
              ) : (
                <div className="flex w-full flex-col gap-4 px-2">
                  <div className="flex max-h-60 w-full flex-col items-center justify-center overflow-y-scroll">
                    <div className="mt-10 w-full p-2">
                      {workouts.data?.map(workout => (
                        <button
                          className="group flex w-full flex-row items-center justify-center gap-2 rounded-md bg-slate-50 py-1 px-2 hover:bg-slate-200"
                          key={workout.id}
                          onClick={() => toggleWorkout(workout)}
                        >
                          <div
                            className={classList(
                              "h-7 w-7 flex-none border-2 text-green-500 transition-all",
                              {
                                "rounded-lg border-slate-400": !chosenWorkouts.find(
                                  w => w.id === workout.id,
                                ),
                                "rounded-2xl border-green-500": !!chosenWorkouts.find(
                                  w => w.id === workout.id,
                                ),
                              },
                            )}
                          >
                            <div className="flex h-full w-full items-center justify-center">
                              {chosenWorkouts.find(w => w.id === workout.id) && (
                                <CheckIcon className="h-full w-full p-1" />
                              )}
                            </div>
                          </div>
                          <div className="flex w-full flex-col rounded-md bg-blue-500 px-3 py-2 text-center text-sm text-white shadow-md">
                            <div className="font-medium">{workout.name}</div>
                            <div className="text-xs font-light">{join(workout.categories)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full">
                    <button
                      className="w-full rounded-full bg-blue-600 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={chosenWorkouts.length === 0}
                      onClick={() => onChoose(chosenWorkouts)}
                    >
                      Copiar treinos selecionados
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative m-2 flex items-center gap-2">
            <input
              type="text"
              className="block h-12 w-full appearance-none rounded-full pl-4 pr-12 shadow-md outline-none ring-0 focus:outline-none focus:ring-0"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
          </div>
          <div className="grow overflow-y-auto" ref={ref}>
            <div className="mx-4 flex h-full flex-1 grow flex-col items-center gap-4">
              {!profiles.data && profiles.isLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Spinner className="fill-blue-600 text-gray-200" />
                </div>
              ) : (
                profiles.data && (
                  <div className="flex w-full max-w-[32rem] flex-col gap-1 pb-4">
                    {profiles.data.pages.flatMap(({ items }) =>
                      items.map(profile => (
                        <button
                          key={profile.id}
                          onClick={() => chooseUser(profile)}
                          className="flex w-full grow flex-row items-center justify-between rounded-md bg-slate-50 shadow-md transition-shadow hover:shadow-xl"
                        >
                          <div className="flex grow items-center truncate p-1 text-left">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                              <ProfilePic user={profile.user} size="sm" />
                            </div>
                            <div className="ml-2 truncate">
                              <div className="truncate text-sm font-medium text-slate-800">
                                {profile.user?.name}
                              </div>
                              <div className="truncate text-xs text-slate-500">{profile.email}</div>
                            </div>
                          </div>
                        </button>
                      )),
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Manage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
