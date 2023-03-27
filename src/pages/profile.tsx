import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import Navbar from "../components/Navbar";
import { getServerAuthSession } from "../server/auth";
import { api } from "../utils/api";
import { dataSheetTranslation } from "../utils/consts";
import type { ParsedDatasheet } from "../utils/types";

const Profile = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Atualizar medidas de <span className="font-bold">{user.name?.split(" ")[0]}</span>
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => {
            void signOut();
          }}
        >
          <ArrowRightOnRectangleIcon />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        <div className="mx-4 mt-4 flex flex-col sm:flex-row">
          {Object.keys(dataSheetTranslation).map(key => {
            return (
              <div
                key={key}
                className="my-1 flex justify-between rounded-lg bg-white p-4 shadow-md"
              >
                <h2 className="text-lg font-medium text-slate-800">
                  {dataSheetTranslation[key as keyof typeof dataSheetTranslation]}
                </h2>
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
              </div>
            );
          })}
          <button
            disabled={!changed}
            className={
              "m-2 flex min-w-fit flex-1 flex-col items-center justify-center rounded-md  px-4 py-3 text-lg text-white shadow-lg transition-colors " +
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

      <Navbar />
    </div>
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
