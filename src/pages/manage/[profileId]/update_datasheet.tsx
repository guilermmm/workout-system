import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Alert from "../../../components/Alert";
import AdminNavbar from "../../../components/admin/Navbar";
import XMarkIcon from "../../../components/icons/XMarkIcon";
import CreateDatasheetPage from "../../../components/pages/CreateDatasheetPage";
import { env } from "../../../env/server.mjs";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";

const AdminUpdateDatasheet = ({
  isSuperUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const { profileId } = router.query as { profileId: string };

  const profile = api.user.getProfileById.useQuery(profileId);

  const latest = api.datasheet.getLatest.useQuery(
    { profileId },
    {
      onSuccess: data => {
        if (data.latest) {
          setDatasheet(data.latest);
        }
      },
      enabled: false,
    },
  );

  useEffect(() => {
    void latest.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [datasheet, setDatasheet] = useState({
    weight: 0,
    height: 0,
    thorax: 0,
    waist: 0,
    abdomen: 0,
    hips: 0,
    rightThigh: 0,
    leftThigh: 0,
    rightArm: 0,
    leftArm: 0,
    rightCalf: 0,
    leftCalf: 0,
  });

  const createDataSheet = api.datasheet.create.useMutation({
    onSuccess: () => {
      void router.back();
    },
  });

  const handleCreateDataSheet = () => {
    createDataSheet.mutate({ profileId, datasheet });
  };

  return (
    <>
      {createDataSheet.isError && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Erro ao criar ficha"
          text="Ocorreu um erro ao criar a ficha de dados. Verifique se os dados estão corretos e tente novamente."
          onClickOutside={() => void createDataSheet.reset()}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md"
            onClick={() => void createDataSheet.reset()}
          >
            Entendi
          </button>
        </Alert>
      )}
      <CreateDatasheetPage
        isLoading={createDataSheet.isLoading}
        mutate={handleCreateDataSheet}
        datasheet={datasheet}
        setDatasheet={setDatasheet}
        profileQuery={profile}
      >
        <AdminNavbar isSuperUser={isSuperUser} />
      </CreateDatasheetPage>
    </>
  );
};

export default AdminUpdateDatasheet;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  const isSuperUser = session.user.email === env.ADMIN_EMAIL;

  return { props: { isSuperUser } };
}
