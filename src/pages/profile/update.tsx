import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ArrowRightOnRectangleIcon from "../../components/icons/ArrowRightOnRectangleIcon";
import ArrowUturnLeftIcon from "../../components/icons/ArrowUturnLeftIcon";
import UserNavbar from "../../components/UserNavbar";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { dataSheetTranslation } from "../../utils/consts";
import type { ParsedDatasheet } from "../../utils/types";

const UpdateMeasure = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [editedDataSheet, setEditedDataSheet] = useState<ParsedDatasheet>(
    Object.keys(dataSheetTranslation).reduce((acc, key) => {
      acc[key as keyof typeof dataSheetTranslation] = 0;
      return acc;
    }, {} as ParsedDatasheet),
  );

  const changed = Object.values(editedDataSheet).every(value => value !== 0);

  const createDataSheet = api.user.createDatasheet.useMutation();

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
          <span className="font-bold">Atualizar medidas</span>
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
        <div className="mx-4 mt-5 grid grid-cols-2 justify-center gap-2">
          {Object.keys(dataSheetTranslation).map((key, index) => {
            return (
              <div
                key={key}
                className={
                  "flex justify-between rounded-lg bg-white p-4 shadow-md " +
                  (index >= 6 && "col-span-2")
                }
              >
                <h2 className="text-lg font-medium text-slate-800">
                  {dataSheetTranslation[key as keyof typeof dataSheetTranslation]}
                </h2>
                <div className="flex gap-1">
                  <input
                    type="number"
                    className="w-12 rounded-md border-2 border-blue-500 text-center"
                    value={editedDataSheet?.[key as keyof typeof dataSheetTranslation]}
                    onChange={e => {
                      setEditedDataSheet({
                        ...editedDataSheet,
                        [key as keyof typeof dataSheetTranslation]: Number(e.target.value),
                      });
                    }}
                  />
                  {key === "weight" ? "kg" : "cm"}
                </div>
              </div>
            );
          })}
          <button
            disabled={!changed}
            className={
              "col-span-2 m-2 mx-10 flex min-w-fit flex-1 flex-col items-center justify-center rounded-md  px-4 py-3 text-lg text-white shadow-lg transition-colors " +
              (changed ? "bg-blue-500 hover:bg-blue-600" : " bg-gray-400")
            }
            onClick={() => {
              createDataSheet.mutate(editedDataSheet);
            }}
          >
            Salvar
          </button>
        </div>
      </div>

      <UserNavbar />
    </div>
  );
};

export default UpdateMeasure;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
