import type { Datasheet } from "@prisma/client";
import type { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import FullPage from "../../components/FullPage";
import Spinner from "../../components/Spinner";
import UserNavbar from "../../components/UserNavbar";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import DownArrowIcon from "../../components/icons/DownArrowIcon";
import UpwardArrowIcon from "../../components/icons/UpwardArrowIcon";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { dataSheetTranslation } from "../../utils/consts";

const DataSheetHistory = () => {
  const router = useRouter();

  const dataSheetHistory = api.user.getDatasheetsBySession.useQuery();

  return (
    <FullPage>
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
        {dataSheetHistory.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          dataSheetHistory.data?.map(measure => (
            <DataSheetCard measure={measure} key={measure.id} />
          ))
        )}
      </div>

      <UserNavbar />
    </FullPage>
  );
};

const DataSheetCard = ({ measure }: { measure: Datasheet }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div className="m-2 rounded-lg bg-white shadow-md">
      <button
        className="flex w-full justify-between p-4"
        onClick={() => {
          setOpened(!opened);
        }}
      >
        {measure.createdAt.toLocaleDateString("pt-BR")}

        {opened ? <UpwardArrowIcon className="h-5 w-5" /> : <DownArrowIcon className="h-5 w-5" />}
      </button>
      {opened && (
        <div className=" border-t-4 p-4 pt-3">
          {Object.keys(dataSheetTranslation).map(key => (
            <div key={key} className="flex justify-between border-b-2">
              <span>{dataSheetTranslation[key as keyof typeof dataSheetTranslation]}:</span>
              <span className="font-bold">
                {measure[key as keyof typeof dataSheetTranslation] || "-"}
                {key !== "weight" ? " cm" : " kg"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataSheetHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
