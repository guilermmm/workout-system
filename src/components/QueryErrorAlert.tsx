import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { useClickOutside } from "../utils";
import Alert from "./Alert";
import XMarkIcon from "./icons/XMarkIcon";

type Props = {
  queries: UseTRPCQueryResult<unknown, unknown>[];
};

const QueryErrorAlert = ({ queries }: Props) => {
  const router = useRouter();

  const errors = useMemo(() => queries.filter(q => q.isError), [queries]);
  const refetch = useCallback(() => errors.forEach(q => void q.refetch()), [errors]);

  const errorAlertRef = useClickOutside<HTMLDivElement>(refetch);

  return (
    <>
      {errors.length > 0 && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-300 p-2 text-red-500" />}
          title="Não conseguimos buscar estes dados"
          text="Não foi possível buscar os dados necessários para acessar esta página, verifique sua conexão e tente novamente"
          ref={errorAlertRef}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md"
            onClick={refetch}
          >
            Tentar novamente
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={router.back}
          >
            Voltar à página anterior
          </button>
        </Alert>
      )}
    </>
  );
};

export default QueryErrorAlert;
