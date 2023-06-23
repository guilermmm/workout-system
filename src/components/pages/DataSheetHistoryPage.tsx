import type { Datasheet } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { classList } from "../../utils";
import { dataSheetTranslation, dataSheetUnit, datasheetLayout } from "../../utils/consts";
import FullPage from "../FullPage";
import MeasurementCard from "../MeasurementCard";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";
import ChevronDownIcon from "../icons/ChevronDownIcon";

interface Props {
  dataSheetHistory: Datasheet[] | undefined;
  isLoading: boolean;
  children?: React.ReactNode;
  profileId?: string;
}

const DataSheetHistoryPage = ({ dataSheetHistory, isLoading, children, profileId }: Props) => {
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
        <h1 className="ml-4 text-lg font-medium text-blue-700">
          <span className="font-bold">Histórico de medidas</span>
        </h1>
      </div>

      <div className="flex grow flex-col items-center overflow-y-auto">
        <div className="flex w-full max-w-[40rem] grow flex-col gap-2 p-2">
          {profileId && (
            <div className="self-end">
              <Link
                className="flex flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
                href={`/manage/${profileId}/update_datasheet`}
              >
                <div className="text-md">Atualizar medidas</div>
              </Link>
            </div>
          )}
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-48 w-48 fill-blue-600 text-gray-200" />
            </div>
          ) : (
            dataSheetHistory &&
            dataSheetHistory.map(datasheet => (
              <DataSheetCard datasheet={datasheet} key={datasheet.id} />
            ))
          )}
        </div>
      </div>

      {children}
    </FullPage>
  );
};

const DataSheetCard = ({ datasheet: datasheet }: { datasheet: Datasheet }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div className="rounded-lg bg-white shadow-md hover:shadow-lg">
      <button
        className="flex w-full justify-between p-4"
        onClick={() => {
          setOpened(!opened);
        }}
      >
        {datasheet.createdAt.toLocaleDateString("pt-BR")}

        <ChevronDownIcon
          className={classList("h-6 w-6 transition-transform duration-200", {
            "rotate-180": opened,
          })}
        />
      </button>
      <div
        className={classList("px-4 transition-all duration-200", {
          "max-h-0 overflow-y-hidden": !opened,
          "border-t-4 py-4": opened,
        })}
      >
        <div className="flex h-full w-full flex-col gap-2">
          {datasheetLayout.map(([left, right], i) => (
            <div key={i} className="flex flex-row gap-2">
              <MeasurementCard
                title={dataSheetTranslation[left]}
                value={datasheet[left]}
                unit={dataSheetUnit[left]}
              />
              <MeasurementCard
                title={dataSheetTranslation[right]}
                value={datasheet[right]}
                unit={dataSheetUnit[right]}
              />
            </div>
          ))}
          <div className="flex">
            <MeasurementCard
              title={dataSheetTranslation["observation"]}
              value={datasheet.observation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSheetHistoryPage;
