import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import Spinner from "../../components/Spinner";
import UserNavbar from "../../components/UserNavbar";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";

const MeasureHistory = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const measureHistory = api.user.getDatasheetsBySession.useQuery();
  console.log(measureHistory.data);

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de medidas</span>
        </h1>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => {
            void signOut();
          }}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        {measureHistory.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          measureHistory.data?.map(measure => (
            <div className="flex justify-between rounded-lg bg-white p-4 shadow-md">
              {measure.createdAt.toLocaleDateString("pt-BR")}
            </div>
          ))
        )}
      </div>

      <UserNavbar />
    </div>
  );
};

export default MeasureHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
