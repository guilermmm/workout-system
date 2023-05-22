import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import AdminNavbar from "../../../components/admin/Navbar";
import WorkoutHistoryPage from "../../../components/pages/WorkoutHistoryPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";

const AdminWorkoutHistory = ({
  isSuperUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const finishedWorkouts = api.finishedWorkout.getManyByProfileId.useQuery(profileId);

  if (finishedWorkouts.isError) return <ErrorPage />;

  return (
    <WorkoutHistoryPage finishedWorkouts={finishedWorkouts.data}>
      <AdminNavbar isSuperUser={isSuperUser} />
    </WorkoutHistoryPage>
  );
};

export default AdminWorkoutHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
