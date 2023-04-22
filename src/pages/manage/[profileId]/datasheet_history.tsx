import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import DataSheetHistoryPage from "../../../components/pages/DataSheetHistoryPage";
import { api } from "../../../utils/api";
import AdminNavbar from "../../../components/AdminNavbar";

const AdminDatasheetHistory = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const { data, isLoading, isError } = api.user.getDatasheets.useQuery({ profileId });

  if (isError) return <ErrorPage />;

  return (
    <DataSheetHistoryPage dataSheetHistory={data} isLoading={isLoading}>
      <AdminNavbar />
    </DataSheetHistoryPage>
  );
};

export default AdminDatasheetHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
