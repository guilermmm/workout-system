import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Loading from "../components/Loading";

const Index = () => {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  if (session?.user.role === "admin") {
    void router.push("/dashboard");
  } else if (session?.user.role === "user") {
    void router.push("/home");
  }

  return status === "loading" || loading ? (
    <Loading />
  ) : (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
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
              <Image
                width={40}
                height={40}
                alt="Google"
                src="/google.svg"
                className="leading-0 rounded-full bg-white"
              />
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
