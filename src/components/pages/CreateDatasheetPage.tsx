import { useRouter } from "next/router";
import { dataSheetTranslation, dataSheetUnit, datasheetLayout } from "../../utils/consts";
import type { ParsedDatasheet } from "../../utils/types";
import FullPage from "../FullPage";
import NumberInput from "../NumberInput";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";

interface Props {
  isLoading: boolean;
  editedDataSheet: ParsedDatasheet;
  setEditedDataSheet: (dataSheet: ParsedDatasheet) => void;
  createDataSheet: (editedDataSheet: ParsedDatasheet) => void;
  children?: React.ReactNode;
}

const CreateDatasheetPage = ({
  isLoading,
  createDataSheet,
  editedDataSheet,
  setEditedDataSheet,
  children,
}: Props) => {
  const router = useRouter();

  const changed = Object.values(editedDataSheet).every(value => value !== 0);

  return (
    <FullPage>
      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-medium text-blue-700">
          <span className="font-bold">Atualizar medidas</span>
        </h1>
      </div>
      <div className="flex grow flex-col items-center justify-center pb-4">
        <div className="flex max-w-[40rem] flex-col items-center overflow-y-auto p-2">
          <div className="flex w-full grow flex-col items-center gap-2 rounded-md border-1 bg-white p-4 shadow-md">
            {datasheetLayout.map(([left, right], i) => (
              <div key={i} className="flex flex-row gap-2">
                <NumberInput
                  className="h-10 w-full bg-white"
                  label={`${dataSheetTranslation[left]} (${dataSheetUnit[left]})`}
                  value={editedDataSheet[left]}
                  onChange={value => setEditedDataSheet({ ...editedDataSheet, [left]: value })}
                  min={0}
                  step={0.1}
                />
                <NumberInput
                  className="h-10 w-full bg-white"
                  label={`${dataSheetTranslation[right]} (${dataSheetUnit[right]})`}
                  value={editedDataSheet[right]}
                  onChange={value => setEditedDataSheet({ ...editedDataSheet, [right]: value })}
                  min={0}
                  step={0.1}
                />
              </div>
            ))}
            <button
              disabled={!changed}
              className="flex w-full flex-col items-center justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600  disabled:cursor-not-allowed disabled:bg-gray-400"
              onClick={() => {
                createDataSheet(editedDataSheet);
              }}
            >
              {isLoading ? <Spinner className="h-7 w-7 fill-blue-600 text-gray-200" /> : "Salvar"}
            </button>
          </div>
        </div>
      </div>
      {children}
    </FullPage>
  );
};

export default CreateDatasheetPage;
