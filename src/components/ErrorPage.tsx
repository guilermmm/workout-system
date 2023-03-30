import { useRouter } from "next/router";
import ExclamationCircleIcon from "./icons/ExclamationCircleIcon";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-red-500 px-4">
      <ExclamationCircleIcon className="h-64 w-64 fill-gray-50" />
      <p className="text-2xl font-medium text-gray-50">Ocorreu um erro ao carregar a página</p>
      <button
        className="rounded-full bg-gray-50 px-6 py-3 text-lg font-medium text-red-500"
        onClick={router.reload}
      >
        Recarregar
      </button>
    </div>
  );
};

export default ErrorPage;
