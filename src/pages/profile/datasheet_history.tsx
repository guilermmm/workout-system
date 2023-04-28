import type { GetServerSidePropsContext } from "next";
import DataSheetHistoryPage from "../../components/pages/DataSheetHistoryPage";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
import { Fragment } from "react";

const DataSheetHistory = () => {
  const { data, isLoading } = api.datasheet.getManyBySession.useQuery();

  return (
    <DataSheetHistoryPage dataSheetHistory={data} isLoading={isLoading}>
      <Fragment />
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
