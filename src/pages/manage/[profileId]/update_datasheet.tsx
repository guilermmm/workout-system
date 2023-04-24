import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorPage from "../../../components/ErrorPage";
import AdminNavbar from "../../../components/admin/Navbar";
import CreateDatasheetPage from "../../../components/pages/CreateDatasheetPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import { dataSheetTranslation } from "../../../utils/consts";
import type { ParsedDatasheet } from "../../../utils/types";

const AdminUpdateDatasheet = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const [editedDataSheet, setEditedDataSheet] = useState<ParsedDatasheet>(
    Object.keys(dataSheetTranslation).reduce((acc, key) => {
      acc[key as keyof typeof dataSheetTranslation] = 0;
      return acc;
    }, {} as ParsedDatasheet),
  );

  if (editedDataSheet.profileId === undefined)
    setEditedDataSheet({
      ...editedDataSheet,
      profileId: profileId,
    });

  console.log(editedDataSheet);

  const createDataSheet = api.user.createDatasheet.useMutation({
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
    >
      <AdminNavbar />
    </CreateDatasheetPage>
  );
};

export default AdminUpdateDatasheet;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
