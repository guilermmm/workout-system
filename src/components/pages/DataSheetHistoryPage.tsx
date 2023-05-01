import type { Datasheet } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { classList } from "../../utils";
import { dataSheetTranslation, datasheetLayout } from "../../utils/consts";
import FullPage from "../FullPage";
import MeasurementCard from "../MeasurementCard";
import Spinner from "../Spinner";
import ArrowUturnLeftIcon from "../icons/ArrowUturnLeftIcon";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import UserProfileButton from "../UserProfileButton";

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

      <div className="grow overflow-y-auto">
        {profileId && (
          <div className="mt-2 flex items-center">
            <UserProfileButton
              title="Atualizar medidas"
              href={`/manage/${profileId}/update_datasheet`}
            />
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

      {children}
    </FullPage>
  );
};

const DataSheetCard = ({ datasheet: datasheet }: { datasheet: Datasheet }) => {
  const [opened, setOpened] = useState(false);
  return (
    <div className="m-2 rounded-lg bg-white shadow-md hover:shadow-lg">
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
                title={dataSheetTranslation[left as keyof typeof dataSheetTranslation]}
                value={`${datasheet[left as keyof typeof dataSheetTranslation]} ${
                  left !== "weight" ? " cm" : " kg"
                }`}
              />
              <MeasurementCard
                title={dataSheetTranslation[right as keyof typeof dataSheetTranslation]}
                value={`${datasheet[right as keyof typeof dataSheetTranslation]} cm`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSheetHistoryPage;
