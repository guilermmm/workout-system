import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorPage from "../../components/ErrorPage";
import CreateDatasheetPage from "../../components/pages/CreateDatasheetPage";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { dataSheetTranslation } from "../../utils/consts";
import type { ParsedDatasheet } from "../../utils/types";

const UserUpdateDatasheet = () => {
  const router = useRouter();

  const [editedDataSheet, setEditedDataSheet] = useState<ParsedDatasheet>(
    Object.keys(dataSheetTranslation).reduce((acc, key) => {
      acc[key as keyof typeof dataSheetTranslation] = 0;
      return acc;
    }, {} as ParsedDatasheet),
  );

  const createDataSheet = api.datasheet.createBySession.useMutation({
    onSuccess: () => {
      void router.back();
    },
  });

  const handleCreateDataSheet = () => {
    createDataSheet.mutate(editedDataSheet);
  };

  if (createDataSheet.isError) return <ErrorPage />;

  return (
    <CreateDatasheetPage
      createDataSheet={handleCreateDataSheet}
      editedDataSheet={editedDataSheet}
      isLoading={createDataSheet.isLoading}
      setEditedDataSheet={setEditedDataSheet}
    />
  );
};

export default UserUpdateDatasheet;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
