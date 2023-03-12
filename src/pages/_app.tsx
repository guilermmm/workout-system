import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import Error from "../components/Error";
import Loading from "../components/Loading";
import ErrorBoundary from "../components/ErrorBoundary";
import { Suspense } from "react";
import Head from "next/head";

import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Workout Tracker</title>
      </Head>
      <ErrorBoundary fallback={<Error />}>
        <Suspense fallback={<Loading />}>
          <Component {...pageProps} />
        </Suspense>
      </ErrorBoundary>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
