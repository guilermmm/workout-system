import type { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Alert from "../../components/Alert";
import DownloadPDFButton from "../../components/DownloadPDFButton";
import FullPage from "../../components/FullPage";
import MeasurementCard from "../../components/MeasurementCard";
import ProfilePic from "../../components/ProfilePic";
import QueryErrorAlert from "../../components/QueryErrorAlert";
import Spinner from "../../components/Spinner";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import ExclamationTriangleIcon from "../../components/icons/ExclamationTriangleIcon";
import { getServerAuthSession } from "../../server/auth";
import { getAge } from "../../utils";
import { api } from "../../utils/api";
import { dataSheetTranslation, dataSheetUnit, datasheetLayout } from "../../utils/consts";
import BasicDocument from "../../utils/pdf";

const Profile = () => {
  const profile = api.user.getProfileBySession.useQuery();

  const workouts = api.workout.getManyBySession.useQuery();

  const latestDataSheet = api.datasheet.getLatestBySession.useQuery();

  const [showAlert, setShowAlert] = useState(false);

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
          {profile.data && (
            <div className="flex flex-col items-center justify-center">
              <h1 className="mt-2 w-full self-start truncate text-center text-lg font-medium text-slate-900">
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
            </div>
          )}
        </div>
        <button
          className="z-10 rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => setShowAlert(true)}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex grow flex-col items-center pb-4">
        <div className="flex w-full max-w-[40rem] grow flex-col items-center overflow-y-auto">
          <div className="flex w-full flex-row items-center gap-2 p-2">
            <Link
              href="/profile/workout_history"
              className="flex w-full justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
            >
              <div>Histórico de treinos</div>
            </Link>
            <DownloadPDFButton
              fileName={`Treino - ${profile.data?.user?.name ?? profile.data?.email ?? ""}.pdf`}
              className="flex w-full justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
              document={<BasicDocument profile={profile.data!} workouts={workouts.data!} />}
            >
              Baixar treinos
            </DownloadPDFButton>
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
