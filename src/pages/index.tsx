import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Suspense, use, useState } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import Loading from "../components/Loading";
import Home from "./home";

const Index = () => {
  const { data: sessionData, status } = useSession();

  const [loading, setLoading] = useState(false);

  return status === "loading" || loading ? (
    <Loading />
  ) : sessionData?.user == null ? (
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
  ) : (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Index;

const Error = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex items-center justify-center">
        <div className="text-2xl font-medium text-white">Ocorreu um erro</div>
        <button
          className="border-2 border-white px-6 py-3 text-2xl font-medium text-slate-900"
          onClick={router.reload}
        >
          Recarregar
        </button>
      </div>
    </div>
  );
};
