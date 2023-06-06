import type { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Alert from "../../components/Alert";
import FullPage from "../../components/FullPage";
import MeasurementCard from "../../components/MeasurementCard";
import Modal from "../../components/Modal";
import ProfilePic from "../../components/ProfilePic";
import QueryErrorAlert from "../../components/QueryErrorAlert";
import Spinner from "../../components/Spinner";
import TextInput from "../../components/TextInput";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import CheckIcon from "../../components/icons/CheckIcon";
import ExclamationTriangleIcon from "../../components/icons/ExclamationTriangleIcon";
import { getServerAuthSession } from "../../server/auth";
import { getAge, useFormValidation } from "../../utils";
import { api } from "../../utils/api";
import { dataSheetTranslation, dataSheetUnit, datasheetLayout } from "../../utils/consts";

const Profile = () => {
  const profile = api.user.getProfileBySession.useQuery();

  const latestDataSheet = api.datasheet.getLatestBySession.useQuery();

  const [showAlert, setShowAlert] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showMutatePasswordAlert, setShowMutatePasswordAlert] = useState(false);

  const [wrongPassword, setWrongPassword] = useState(false);

  const [user, setUser] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [
    { error: oldPasswordErrorProp, ...oldPasswordProps },
    { error: oldPasswordError, resetError: resetOldPasswordError },
  ] = useFormValidation(
    user.oldPassword,
    v => {
      if (v.length < 6) {
        return "Senha deve ter no mínimo 6 caracteres";
      }
    },
    false,
  );

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

  const updatePassword = api.user.updatePassword.useMutation({
    onSuccess: () => {
      setShowMutatePasswordAlert(false);
      setShowChangePasswordModal(false);
      setUser({ oldPassword: "", password: "", confirmPassword: "" });
    },
    onError: () => {
      setShowMutatePasswordAlert(false);
      setWrongPassword(true);
    },
  });

  return (
    <FullPage>
      <QueryErrorAlert queries={[profile, latestDataSheet]} />
      {showAlert && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-700" />
          }
          title="Sair"
          text="Tem certeza que deseja sair?"
          onClickOutside={() => setShowAlert(false)}
        >
          <button
            className="rounded-md border-1 border-red-600 bg-red-600 py-2 px-4 text-white shadow-md"
            onClick={() => void signOut()}
          >
            Sair
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setShowAlert(false)}
          >
            Cancelar
          </button>
        </Alert>
      )}
      {showChangePasswordModal && (
        <Modal
          onClickOutside={() => {
            setShowChangePasswordModal(false);
            setUser({
              password: "",
              confirmPassword: "",
              oldPassword: "",
            });
            resetConfirmPasswordError();
            resetOldPasswordError();
            resetPasswordError();
            setWrongPassword(false);
          }}
          buttons={
            <>
              <button
                onClick={() => {
                  setShowMutatePasswordAlert(true);
                }}
                className="rounded-md bg-blue-500 px-3 py-2 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !user.oldPassword ||
                  !user.password ||
                  !user.confirmPassword ||
                  !!confirmPasswordProps.error ||
                  !!passwordProps.error ||
                  !!oldPasswordErrorProp
                }
              >
                Atualizar
              </button>
              <button
                className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setUser({
                    password: "",
                    confirmPassword: "",
                    oldPassword: "",
                  });
                  resetConfirmPasswordError();
                  resetOldPasswordError();
                  resetPasswordError();
                  setWrongPassword(false);
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
          <div className="mb-2">
            <TextInput
              label="Senha atual"
              className="rounded-md bg-slate-50"
              value={user.oldPassword}
              onChange={v => setUser({ ...user, oldPassword: v })}
              type="password"
              error={wrongPassword ? "Senha atual incorreta" : oldPasswordErrorProp}
              {...oldPasswordProps}
            />
            {oldPasswordErrorProp && (
              <span className="text-xs text-red-500">{oldPasswordErrorProp}</span>
            )}
            {wrongPassword && (
              <span className="mb-2 text-xs text-red-500">Senha atual incorreta</span>
            )}
          </div>

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
          text={`Tem certeza que deseja alterar a senha do usuário?`}
          onClickOutside={() => setShowMutatePasswordAlert(false)}
        >
          <button
            className="rounded-md border-1 bg-green-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (
                !user.password ||
                !user.confirmPassword ||
                !user.oldPassword ||
                oldPasswordError() ||
                passwordError() ||
                confirmPasswordError()
              )
                return;

              updatePassword.mutate({
                oldPassword: user.oldPassword,
                newPassword: user.password,
              });
            }}
          >
            {updatePassword.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner className="h-6 w-6 fill-blue-600 text-gray-200" />
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
          {!updatePassword.isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowMutatePasswordAlert(false)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      <div className="relative flex h-full flex-col overflow-y-auto">
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
          </div>
          <button
            className="z-10 rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
            onClick={() => setShowAlert(true)}
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex grow flex-col items-center pb-4">
          {profile.data && (
            <div className="flex min-w-0 max-w-full flex-col items-center justify-center px-2">
              <h1 className="mt-2 w-full  self-start truncate text-center text-lg font-medium text-slate-900">
                {profile.data.user?.name ?? profile.data.email}
              </h1>
              {profile.data.birthdate && (
                <h1 className="my-1 w-full self-start truncate text-center text-lg font-medium text-slate-900">
                  {`${getAge(
                    profile.data.birthdate,
                  )} anos - ${profile.data.birthdate.toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}`}
                </h1>
              )}
            </div>
          )}
          <div className="flex w-full max-w-[40rem] grow flex-col items-center overflow-y-auto">
            <div className="flex w-full flex-row items-center gap-2 p-2">
              <Link
                href="/profile/workout_history"
                className="flex h-full w-full justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
              >
                <div>Histórico de treinos</div>
              </Link>
              <Link
                href={`profile/pdf`}
                className="flex h-full w-full items-center justify-center rounded-md bg-blue-500 px-6 py-3 text-center text-sm text-white shadow-md transition-colors hover:bg-blue-600"
              >
                Baixar Treinos
              </Link>
            </div>
            <div className="flex w-full grow flex-col justify-center gap-2 p-2">
              {latestDataSheet.isLoading ? (
                <div className="flex h-full w-full justify-center">
                  <Spinner className="h-48 w-48 fill-blue-600 text-gray-50" />
                </div>
              ) : latestDataSheet.data?.latest ? (
                <div className="flex w-full flex-col gap-2 rounded-md border-1 bg-white p-4 shadow-md">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col p-1 text-lg font-medium text-slate-900">
                      <h2>Medidas atuais</h2>
                      <div className="h-1 w-full bg-gold-500" />
                    </div>
                    <Link
                      href="/profile/update_datasheet"
                      className="flex flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
                    >
                      <div>Atualizar medidas</div>
                    </Link>
                  </div>
                  <div className="flex h-full w-full flex-col gap-2">
                    {datasheetLayout.map(([left, right], i) => (
                      <div key={i} className="flex flex-row gap-2">
                        <MeasurementCard
                          title={dataSheetTranslation[left]}
                          value={`${latestDataSheet.data.latest![left]} ${dataSheetUnit[left]}`}
                        />
                        <MeasurementCard
                          title={dataSheetTranslation[right]}
                          value={`${latestDataSheet.data.latest![right]} ${dataSheetUnit[right]}`}
                        />
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/profile/datasheet_history"
                    className="mt-4 flex flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    Histórico de medidas
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-center">Não há medidas cadastradas</p>
                  <Link
                    href="/profile/update_datasheet"
                    className="flex flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
                  >
                    <div>Cadastrar medidas</div>
                  </Link>
                </div>
              )}
            </div>
            {profile.data?.user?.credentialsId && (
              <div className="flex w-full grow flex-col justify-center gap-2 p-2">
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="flex w-full flex-col items-center justify-center rounded-md bg-blue-500 py-3 px-6 text-white shadow-md transition-colors hover:bg-blue-600"
                >
                  Atualizar senha
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default Profile;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
