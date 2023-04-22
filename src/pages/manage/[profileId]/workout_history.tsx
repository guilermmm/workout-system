import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import ErrorPage from "../../../components/ErrorPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import AdminNavbar from "../../../components/AdminNavbar";
import WorkoutHistoryPage from "../../../components/pages/WorkoutHistoryPage";

const AdminWorkoutHistory = () => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const workouts = api.workout.getMany.useQuery({ profileId });
  const finishedWorkouts = api.user.getFinishedWorkouts.useQuery({ profileId });

  if (workouts.isError || finishedWorkouts.isError) return <ErrorPage />;

  return (
    <WorkoutHistoryPage workouts={workouts.data} finishedWorkouts={finishedWorkouts.data}>
      <AdminNavbar />
    </WorkoutHistoryPage>
  );
};

export default AdminWorkoutHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
