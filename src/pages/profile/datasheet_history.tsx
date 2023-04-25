import type { GetServerSidePropsContext } from "next";
import DataSheetHistoryPage from "../../components/pages/DataSheetHistoryPage";
import UserNavbar from "../../components/user/Navbar";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";

const DataSheetHistory = () => {
  const { data, isLoading } = api.user.getDatasheetsBySession.useQuery();

  return (
    <DataSheetHistoryPage dataSheetHistory={data} isLoading={isLoading}>
      <UserNavbar />
    </DataSheetHistoryPage>
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
