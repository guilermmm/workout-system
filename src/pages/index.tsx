import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Loading from "../components/Loading";
import ProfilePic from "../components/ProfilePic";

const Index = () => {
  const session = useSession();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  if (session.status === "loading" || loading) {
    return <Loading />;
  }

  if (session.data != null) {
    if (session.data.user.role === "admin") {
      void router.push("/dashboard");
    } else if (session.data.user.role === "user") {
      void router.push("/home");
    }

    return <Loading />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex w-fit flex-col items-center justify-center px-5 text-6xl font-bold">
        <Image alt="logo" src="/logo1.png" width={300} height={223} />
        <Image alt="logo" src="/logo2.png" width={200} height={223} />
      </div>
      <div>
        <div className="font-medium text-white">
          <button
            onClick={() => {
              setLoading(true);
              void signIn("google");
            }}
            className="block rounded-full bg-blue-600 p-3 transition-colors hover:bg-blue-500"
          >
            <div className="flex items-center justify-center">
              <ProfilePic size="sm" alt="Google" />
              <span className="mx-3">Entrar com Google</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;

export function getServerSideProps() {
  return { props: {} };
}
