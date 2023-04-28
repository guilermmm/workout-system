import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import FullPage from "../../components/FullPage";
import UserProfileButton from "../../components/UserProfileButton";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { dataSheetTranslation } from "../../utils/consts";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import Link from "next/link";

const Profile = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const latestDataSheet = api.datasheet.getLatestBySession.useQuery();
  return (
    <FullPage>
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center truncate">
          <Link
            href="/home"
            className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="ml-4 truncate text-lg font-medium text-blue-700">
            <span className="font-bold">Perfil de {user.name}</span>
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => {
            void signOut();
          }}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow overflow-y-scroll pb-4">
        <div className="mt-4">
          <UserProfileButton title="Histórico de treinos" href="/profile/workout_history" />
          <UserProfileButton title="Histórico de medidas" href="/profile/datasheet_history" />
          <UserProfileButton title="Atualizar medidas" href="/profile/update_datasheet" />
        </div>
        <div>
          <h2 className="my-3 flex justify-center text-xl font-medium text-slate-800">
            Medidas atuais:
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.keys(dataSheetTranslation).map(key => {
              return (
                <div
                  key={key}
                  className="flex w-2/5 justify-between rounded-lg bg-white p-4 shadow-md"
                >
                  <h2 className="text-lg font-medium text-slate-800">
                    {dataSheetTranslation[key as keyof typeof dataSheetTranslation]}:
                  </h2>
                  <h2 className="text-lg font-medium text-slate-800">
                    {latestDataSheet.data?.[key as keyof typeof dataSheetTranslation] ?? "-"}
                    {key !== "weight" ? " cm" : " kg"}
                  </h2>
                </div>
              );
            })}
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

  return { props: { user: session.user } };
}
