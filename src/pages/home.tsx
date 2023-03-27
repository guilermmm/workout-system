import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { getServerAuthSession } from "../server/auth";

const WorkoutsTab = dynamic(() => import("../components/WorkoutsTab"), { ssr: false });

const Home = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{user.name}</span>!
          </h1>
        </div>
        <button
          className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
          onClick={() => void signOut()}
        >
          <ArrowRightOnRectangleIcon />
        </button>
      </div>
      <div className="grow overflow-y-scroll">
        <div className="mx-4 mt-4 flex flex-col flex-wrap items-stretch sm:flex-row">
          <Suspense fallback={<Spinner />}>
            <WorkoutsTab />
          </Suspense>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default Home;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role === "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { user: session.user } };
}
