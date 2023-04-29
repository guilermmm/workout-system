import type { Datasheet } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { classList } from "../../utils";
import { dataSheetTranslation } from "../../utils/consts";
import FullPage from "../FullPage";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";
import UpwardArrowIcon from "../icons/UpwardArrowIcon";

interface Props {
  dataSheetHistory: Datasheet[] | undefined;
  children: React.ReactNode;
  isLoading: boolean;
}

const DataSheetHistoryPage = ({ dataSheetHistory, children, isLoading }: Props) => {
  const router = useRouter();

  return (
    <FullPage>
      <div className="flex items-center bg-gold-500 p-2">
        <button
          className="rounded-full p-5 text-blue-700 transition-colors hover:bg-white"
          onClick={() => router.back()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de medidas</span>
        </h1>
      </div>

      <div className="grow overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
          </div>
        ) : (
          dataSheetHistory &&
          dataSheetHistory.map(measure => <DataSheetCard measure={measure} key={measure.id} />)
        )}
      </div>

      {children}
    </FullPage>
  );
};

const DataSheetCard = ({ measure }: { measure: Datasheet }) => {
  // transition-all duration-300 ease-in-out
  const [opened, setOpened] = useState(false);
  return (
    <div className="m-2 rounded-lg bg-white shadow-md  hover:shadow-lg">
      <button
        className="flex w-full justify-between p-4"
        onClick={() => {
          setOpened(!opened);
        }}
      >
        {measure.createdAt.toLocaleDateString("pt-BR")}

        <UpwardArrowIcon
          className={classList(
            "h-5 w-5 transition-transform duration-300",
            opened ? "rotate-180  ease-in-out" : "",
          )}
        />
      </button>

      <div
        className={classList(
          "box-border max-h-0 overflow-hidden border-t-4 p-4 pt-3",
          opened ? "max-h-fit" : "hidden",
        )}
      >
        {Object.keys(dataSheetTranslation).map(key => (
          <div key={key} className="flex justify-between border-b-2">
            <span>{dataSheetTranslation[key as keyof typeof dataSheetTranslation]}:</span>
            <span className="font-bold">
              {measure[key as keyof typeof dataSheetTranslation] || "-"}
              {key !== "weight" ? " cm" : " kg"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSheetHistoryPage;
