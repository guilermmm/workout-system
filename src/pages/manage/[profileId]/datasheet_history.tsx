import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import AdminNavbar from "../../../components/admin/Navbar";
import DataSheetHistoryPage from "../../../components/pages/DataSheetHistoryPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";

const AdminDatasheetHistory = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const { data, isLoading, isError } = api.datasheet.getMany.useQuery({ profileId });

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
