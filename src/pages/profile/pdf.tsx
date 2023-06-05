import type { GetServerSidePropsContext } from "next";
import DownloadPDF from "../../components/DownloadPDF";
import FullPage from "../../components/FullPage";
import Loading from "../../components/Loading";
import QueryErrorAlert from "../../components/QueryErrorAlert";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";

const PDFPage = () => {
  const profile = api.user.getProfileBySession.useQuery();
  const workouts = api.workout.getManyWithExercisesBySession.useQuery();

  if (profile.isLoading || workouts.isLoading) {
    return <Loading />;
  }

  return (
    <FullPage>
      <QueryErrorAlert queries={[profile, workouts]} />
      {profile.data && workouts.data && (
        <DownloadPDF profile={profile.data} workouts={workouts.data} />
      )}
    </FullPage>
  );
};

export default PDFPage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
