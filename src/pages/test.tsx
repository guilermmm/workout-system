import { useState } from "react";
import FullPage from "../components/FullPage";
import { ImageInput } from "../components/ImageInput";
import XMarkIcon from "../components/icons/XMarkIcon";

const Test = () => {
  const [imageUrl, setImageUrl] = useState<string>();

  return (
    <FullPage>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <ImageInput
          className="h-40 w-40 rounded-md bg-slate-500 text-white"
          imageUrl={imageUrl}
          onChange={setImageUrl}
        />
        {imageUrl !== undefined && (
          <div className="">
            <button type="button" className="h-10 w-10" onClick={() => setImageUrl(undefined)}>
              <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500">
                <XMarkIcon className="h-6 w-6 text-white" />
              </div>
            </button>
          </div>
        )}
      </div>
    </FullPage>
  );
};

export default Test;
