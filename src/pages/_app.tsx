import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import Head from "next/head";
import { ModalProvider } from "../components/Modal";
import { api } from "../utils/api";

import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ModalProvider>
        <Head>
          <title>Workout Tracker</title>
        </Head>
        <Component {...pageProps} />
      </ModalProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
