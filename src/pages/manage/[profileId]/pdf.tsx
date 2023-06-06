import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import DownloadPDF from "../../../components/DownloadPDF";
import FullPage from "../../../components/FullPage";
import Loading from "../../../components/Loading";
import QueryErrorAlert from "../../../components/QueryErrorAlert";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";

const PDFPage = () => {
  const router = useRouter();
  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);
  const workouts = api.workout.getManyWithExercises.useQuery({ profileId });

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

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
