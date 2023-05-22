import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import AdminNavbar from "../../../components/admin/Navbar";
import DataSheetHistoryPage from "../../../components/pages/DataSheetHistoryPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";

const AdminDatasheetHistory = ({
  isSuperUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const { data, isLoading, isError } = api.datasheet.getMany.useQuery({ profileId });

  if (isError) return <ErrorPage />;

  return (
    <DataSheetHistoryPage dataSheetHistory={data} isLoading={isLoading} profileId={profileId}>
      <AdminNavbar isSuperUser={isSuperUser} />
    </DataSheetHistoryPage>
  );
};

export default AdminDatasheetHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
