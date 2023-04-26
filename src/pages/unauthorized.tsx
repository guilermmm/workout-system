import { useRouter } from "next/router";
import ExclamationCircleIcon from "../components/icons/ExclamationCircleIcon";

const Unauthorized = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400 px-4">
      <ExclamationCircleIcon className="h-64 w-64 fill-blue-500" />
      <p className="text-2xl font-medium text-blue-500 text-center">Você não tem um cadastro ativo, entre em contato com a recepção para regularizar sua situação.</p>
      <button
        className="rounded-full bg-blue-500 px-6 py-3 text-lg font-medium text-white"
        onClick={() => void router.push("/")}
      >
        Página inicial
      </button>
    </div>
  );
};

export default Unauthorized;
