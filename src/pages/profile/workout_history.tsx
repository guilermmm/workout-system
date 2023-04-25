import type { GetServerSidePropsContext } from "next";
import WorkoutHistoryPage from "../../components/pages/WorkoutHistoryPage";
import UserNavbar from "../../components/user/Navbar";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
const WorkoutHistory = () => {
  const workouts = api.workout.getManyBySession.useQuery();
  const finishedWorkouts = api.user.getFinishedWorkoutsBySession.useQuery();

  return (
    <WorkoutHistoryPage workouts={workouts.data} finishedWorkouts={finishedWorkouts.data}>
      <UserNavbar />
    </WorkoutHistoryPage>
  );
};

export default WorkoutHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
