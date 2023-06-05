import { useRouter } from "next/router";
import { api } from "../../utils/api";
import { BlobProvider } from "@react-pdf/renderer";
import BasicDocument from "../../utils/pdf";
import FullPage from "../../components/FullPage";
import Spinner from "../../components/Spinner";

const DownloadPDF = () => {
  const router = useRouter();
  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);
  const workouts = api.workout.getManyWithExercises.useQuery({ profileId });

  function downloadURI(uri: string, name: string) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {profile.data && workouts.data && (
        <BlobProvider document={<BasicDocument profile={profile.data} workouts={workouts.data} />}>
          {({ blob, url, loading, error }) => {
            if (loading) {
              return (
                <FullPage>
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner />
                  </div>
                </FullPage>
              );
            }

            if (error) {
              router.back();
            }

            if (blob) {
              downloadURI(
                url ?? "",
                `Treino - ${profile.data?.user?.name ?? profile.data?.email ?? ""}.pdf`,
              );
            }
          }}
        </BlobProvider>
      )}
    </div>
  );
};

export default DownloadPDF;
