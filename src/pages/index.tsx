import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Loading from "../components/Loading";
import TextInput from "../components/TextInput";
import { useFormValidation, validateEmail } from "../utils";

const Index = () => {
  const session = useSession();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailProps, { error: emailError }] = useFormValidation(
    email,
    v => (validateEmail(v) ? false : "Email inválido"),
    false,
  );

  const [passwordProps, { error: passwordError }] = useFormValidation(
    password,
    v => (v.length >= 3 ? false : "Senha deve ter 3 ou mais caracteres"),
    false,
  );

  const [credentialsError, setCredentialsError] = useState<string | null>(null);

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
      <div className="flex flex-col gap-2 font-medium text-white">
        <form
          className="flex flex-col gap-3 rounded-xl bg-white p-3"
          onSubmit={e => {
            e.preventDefault();

            setCredentialsError(null);

            if (emailError() || passwordError()) {
              return;
            }

            setLoading(true);
            void signIn("credentials", {
              email,
              password,
              redirect: false,
            }).then(res => {
              setLoading(false);
              if (res?.error) {
                setCredentialsError(res.error);
              }
            });
          }}
        >
          {credentialsError && (
            <div className="rounded-md bg-red-500 py-2 px-3 text-center text-sm text-white">
              {credentialsError}
            </div>
          )}
          <TextInput
            className="bg-white"
            label="Email"
            name="email"
            value={email}
            onChange={v => setEmail(v.toLowerCase().trim())}
            {...emailProps}
          />
          {emailProps.error && <span className="text-xs text-red-500">{emailProps.error}</span>}
          <TextInput
            className="bg-white"
            label="Senha"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            {...passwordProps}
          />
          {passwordProps.error && (
            <span className="text-xs text-red-500">{passwordProps.error}</span>
          )}
          <button
            type="submit"
            className="block w-full rounded-md bg-blue-600 p-4 text-sm transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!email || !password || !!emailProps.error || !!passwordProps.error}
          >
            Entrar com credenciais
          </button>
        </form>
        <div className="flex flex-row items-center text-slate-900">
          <div className="h-0.5 w-full rounded bg-slate-900/50" />
          <span className="px-1">OU</span>
          <div className="h-0.5 w-full rounded bg-slate-900/50" />
        </div>
        <button
          onClick={() => {
            setLoading(true);
            void signIn("google");
          }}
          className="block rounded-full bg-blue-600 p-3 transition-colors hover:bg-blue-500"
        >
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-white">
              <Image
                src="/google.svg"
                alt="Google"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <span className="mx-3 grow text-center">Entrar com Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Index;

export function getServerSideProps() {
  return { props: {} };
}
