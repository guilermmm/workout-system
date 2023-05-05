import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/router";
import { useState } from "react";
import type { RouterOutputs } from "../../utils/api";
import {
  dataSheetStep,
  dataSheetTranslation,
  dataSheetUnit,
  datasheetLayout,
} from "../../utils/consts";
import Alert from "../Alert";
import FullPage from "../FullPage";
import NumberInput from "../NumberInput";
import QueryErrorAlert from "../QueryErrorAlert";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";
import ExclamationTriangleIcon from "../icons/ExclamationTriangleIcon";

type Datasheet = Record<keyof typeof dataSheetTranslation, number>;

interface Props {
  isLoading: boolean;
  datasheet: Datasheet;
  setDatasheet: (dataSheet: Datasheet) => void;
  mutate: (editedDataSheet: Datasheet) => void;
  profileQuery: UseTRPCQueryResult<
    RouterOutputs["user"]["getProfileById" | "getProfileBySession"],
    unknown
  >;
  children?: React.ReactNode;
}

const CreateDatasheetPage = ({
  isLoading,
  mutate,
  datasheet,
  setDatasheet,
  profileQuery,
  children,
}: Props) => {
  const router = useRouter();

  const valid = Object.values(datasheet).some(value => value !== 0);

  const [showAlert, setShowAlert] = useState(false);

  return (
    <FullPage>
      <QueryErrorAlert queries={[profileQuery]} />
      {showAlert && (
        <Alert
          icon={
            <ExclamationTriangleIcon className="h-10 w-10 rounded-full bg-gold-200 p-2 text-gold-700" />
          }
          title="Atualizar medidas"
          text="Tem certeza que deseja atualizar as medidas?"
          onClickOutside={() => setShowAlert(false)}
        >
          <button
            className="rounded-md border-1 border-blue-600 bg-blue-600 py-2 px-4 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              mutate(datasheet);
              setShowAlert(false);
            }}
            disabled={!valid}
          >
            {isLoading ? <Spinner className="h-6 w-6 text-white" /> : "Atualizar"}
          </button>
          {!isLoading && (
            <button
              className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
              onClick={() => setShowAlert(false)}
            >
              Cancelar
            </button>
          )}
        </Alert>
      )}
      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium text-blue-700">
          {profileQuery.isLoading ? (
            <span>Atualizar medidas</span>
          ) : (
            profileQuery.data && (
              <span>
                Atualizar medidas de{" "}
                <span className="font-bold">
                  {profileQuery.data.user?.name ?? profileQuery.data.email}
                </span>
              </span>
            )
          )}
        </h1>
      </div>
      <div className="flex grow flex-col items-center justify-center pb-4">
        <div className="flex max-w-[40rem] flex-col items-center overflow-y-auto p-2">
          {profileQuery.isLoading ? (
            <Spinner className="h-32 w-32 fill-blue-600 text-gray-200" />
          ) : (
            <div className="flex w-full grow flex-col items-center gap-2 rounded-md border-1 bg-white p-4 shadow-md">
              {datasheetLayout.map(([left, right], i) => (
                <div key={i} className="flex flex-row gap-2">
                  <NumberInput
                    className="h-10 w-full bg-white"
                    label={`${dataSheetTranslation[left]} (${dataSheetUnit[left]})`}
                    value={datasheet[left]}
                    onChange={value => setDatasheet({ ...datasheet, [left]: value })}
                    min={0}
                    step={dataSheetStep[left]}
                  />
                  <NumberInput
                    className="h-10 w-full bg-white"
                    label={`${dataSheetTranslation[right]} (${dataSheetUnit[right]})`}
                    value={datasheet[right]}
                    onChange={value => setDatasheet({ ...datasheet, [right]: value })}
                    min={0}
                    step={dataSheetStep[right]}
                  />
                </div>
              ))}
              <button
                disabled={!valid}
                className="flex w-full flex-col items-center justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600  disabled:cursor-not-allowed disabled:bg-gray-400"
                onClick={() => setShowAlert(true)}
              >
                {isLoading ? <Spinner className="h-7 w-7 fill-blue-600 text-gray-200" /> : "Salvar"}
              </button>
            </div>
          )}
        </div>
      </div>
      {children}
    </FullPage>
  );
};

export default CreateDatasheetPage;
