import { useRouter } from "next/router";

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

export default Error;
