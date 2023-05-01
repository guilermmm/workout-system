import type { GetServerSidePropsContext } from "next";
import { Fragment } from "react";
import WorkoutHistoryPage from "../../components/pages/WorkoutHistoryPage";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";
const WorkoutHistory = () => {
  const workouts = api.workout.getManyBySession.useQuery();
  const finishedWorkouts = api.user.getFinishedWorkoutsBySession.useQuery();

  return (
    <WorkoutHistoryPage workouts={workouts.data} finishedWorkouts={finishedWorkouts.data}>
      <Fragment />
    </WorkoutHistoryPage>
  );
};

export default WorkoutHistory;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
