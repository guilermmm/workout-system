import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import ArrowRightOnRectangleIcon from "../components/icons/ArrowRightOnRectangleIcon";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { env } from "../env/server.mjs";
import { getServerAuthSession } from "../server/auth";

const ManagementTab = dynamic(() => import("../components/ManagementTab"), { ssr: false });

const Dashboard = () => {
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex items-center justify-between bg-gold-500 p-2">
        <div className="flex items-center">
          <Image
            width={64}
            height={64}
            src={session?.user.image ?? ""}
            alt="Foto de perfil"
            className="rounded-full"
          />
          <h1 className="ml-4 text-lg font-medium text-blue-700">
            Olá, <span className="font-bold">{session?.user.name}</span>!
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
        <div className=" mx-4 flex flex-col flex-wrap items-stretch sm:flex-row">
          <Suspense fallback={<Spinner />}>
            <ManagementTab />
          </Suspense>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Dashboard;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.email !== env.ADMIN_EMAIL) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
