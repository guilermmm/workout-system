import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import Link from "next/link";
import ProfilePic from "../../components/ProfilePic";
import UserNavbar from "../../components/UserNavbar";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { dataSheetTranslation } from "../../utils/consts";

const Profile = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const latestDataSheet = api.user.getLatestDatasheetBySession.useQuery();
  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <ProfilePic user={user} size="lg" />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            <span className="font-bold">{user.name}</span>
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
          <OptionCard title="Histórico de treinos" href="#" />
          <OptionCard title="Histórico de medidas" href="/profile/datasheet_history" />
          <OptionCard title="Atualizar medidas" href="/profile/update" />
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

      <UserNavbar />
    </div>
  );
};

export default Profile;

interface OptionCardProps {
  title: string;
  href: string;
}

const OptionCard = ({ title, href }: OptionCardProps) => {
  return (
    <Link
      href={href}
      className="m-2 flex min-w-fit flex-col justify-center rounded-md bg-blue-500 py-6 px-9 text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div className="text-xl">{title}</div>
    </Link>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
