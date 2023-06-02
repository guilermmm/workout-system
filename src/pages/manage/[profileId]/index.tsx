import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Alert from "../../../components/Alert";
import DownloadPDFButton from "../../../components/DownloadPDFButton";
import FullPage from "../../../components/FullPage";
import ProfilePic from "../../../components/ProfilePic";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import Spinner from "../../../components/Spinner";
import ArrowUturnLeftIcon from "../../../components/icons/ArrowUturnLeftIcon";
import ExclamationCircleIcon from "../../../components/icons/ExclamationCircleIcon";
import PencilSquareIcon from "../../../components/icons/PencilSquareIcon";
import TrashIcon from "../../../components/icons/TrashIcon";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import { getServerAuthSession } from "../../../server/auth";
import {
  capitalize,
  classList,
  getAge,
  join,
  useFormValidation,
  validateEmail,
} from "../../../utils";
import type { RouterOutputs } from "../../../utils/api";
import { api } from "../../../utils/api";
import BasicDocument from "../../../utils/pdf";
import CheckIcon from "../../../components/icons/CheckIcon";
import Modal from "../../../components/Modal";
import TextInput from "../../../components/TextInput";
import DatePicker from "../../../components/DatePicker";

type Workout = RouterOutputs["workout"]["getMany"][number];

const Manage = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId, {
    onSuccess: data => {
      setEmail(data.email);
      setBirthdate(data.birthdate);
    },
  });
  const workouts = api.workout.getMany.useQuery({ profileId });

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

  const [email, setEmail] = useState(profile.data?.email ?? "");
  const [birthdate, setBirthdate] = useState<Date | null>(profile.data?.birthdate ?? null);

  const emailProps = useFormValidation(
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
    },
  });

  const [toRemove, setToRemove] = useState<Workout | null>(null);

  const deleteWorkout = api.workout.delete.useMutation({
    onSuccess: () => {
      setToRemove(null);
      void workouts.refetch();
    },
  });

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
          text={`Tem certeza que deseja ${
            profile.data.isActive ? "desativar" : "ativar"
          } o usuário ${profile.data.user?.name ?? profile.data.email}?`}
          onClickOutside={() => setShowMutateAlert(false)}
        >
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
        </Alert>
      )}
      {profile.data && toRemove && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-200 p-2 text-red-500" />}
          title="Excluir treino"
          text={`Tem certeza que deseja excluir o treino ${toRemove.name} do usuário ${
            profile.data.user?.name ?? profile.data.email
          }?`}
          onClickOutside={() => setToRemove(null)}
        >
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
        </Alert>
      )}
      {showMutateProfileModal && (
        <Modal
          onClickOutside={() => setShowMutateProfileModal(false)}
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
                onClick={() => setShowMutateProfileModal(false)}
              >
                Cancelar
              </button>
            </>
          }
        >
          <h1 className="self-center font-medium">
            Atualizar usuário {profile.data?.user?.name ?? profile.data?.email}
          </h1>
          <TextInput
            label="Email"
            className="rounded-md bg-white"
            value={email}
            onChange={setEmail}
            {...emailProps}
          />
          <DatePicker
            label="Data de nascimento"
            className="rounded-md bg-white"
            value={birthdate}
            onChange={setBirthdate}
          />
        </Modal>
      )}
      {showMutateProfileConfirmAlert && (
        <Alert
          icon={<CheckIcon className="h-10 w-10 rounded-full bg-green-300 p-2 text-green-600" />}
          title="Confirmar Atualização"
          text={`Tem certeza que deseja realizar essas alterações?`}
          onClickOutside={() => setShowMutateProfileConfirmAlert(false)}
        >
          <button
            className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (!birthdate) return;
              updateProfile.mutate({ id: profileId, email, birthdate });
              setEmail("");
              setBirthdate(null);
              setShowMutateProfileModal(false);
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
        </Alert>
      )}
      <div className="relative flex w-full flex-row items-start justify-between bg-slate-100 p-2">
        <div className="absolute left-0 top-0 right-0 h-20 bg-gold-500" />
        <Link
          href="/home"
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
          {profile.isLoading ? (
            <div className="h-12" />
          ) : (
            profile.data && (
              <div className="flex flex-col items-center justify-center">
                <h1 className="my-1 w-full self-start truncate text-center text-lg font-medium text-slate-900">
                  <span className="font-bold">{profile.data.user?.name ?? profile.data.email}</span>
                </h1>
                {profile.data.birthdate && (
                  <h1 className="my-1 w-full self-start truncate text-center text-lg font-medium text-slate-900">
                    <span>
                      {`${getAge(
                        profile.data.birthdate,
                      )} anos - ${profile.data.birthdate.toLocaleDateString()}`}
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
            )
          )}
        </div>
        <div className="p-5">
          <div className="h-6 w-6" />
        </div>
      </div>
      <div className="flex flex-col items-center">
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
                <h3 className="w-full text-start text-sm">
                  Última atualização: {profile.data?.workoutUpdateDate?.toLocaleDateString()}
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
                        Treino <span className="font-medium">{workout.name}</span>
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
              <div className="mt-4 flex w-full max-w-[32rem] flex-row justify-center gap-2">
                <Link
                  className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                  href={`/manage/${profileId}/create_workout`}
                >
                  Adicionar treino
                </Link>
                <DownloadPDFButton
                  fileName={`Treino - ${profile.data?.user?.name ?? profile.data?.email ?? ""}.pdf`}
                  className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                  document={<BasicDocument profile={profile.data!} workouts={workouts.data} />}
                >
                  Baixar treinos
                </DownloadPDFButton>
                <button
                  onClick={() => setShowMutateProfileModal(true)}
                  className="w-full rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
                >
                  Atualizar perfil
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </FullPage>
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
