import { forwardRef, type ForwardedRef } from "react";
import { useModal } from "./ModalContext";

type Props = {
  icon: React.ReactNode;
  title: string;
  text: string;
  children: React.ReactNode;
};

function Alert({ icon, title, text, children }: Props, ref: ForwardedRef<HTMLDivElement>) {
  const ShowModal = useModal();

  return (
    <ShowModal className="bg-black bg-opacity-25">
      <div
        className="m-2 flex max-w-lg flex-col gap-4 rounded-md bg-slate-50 p-6 shadow-md"
        ref={ref}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="self-center sm:self-auto">{icon}</div>
          <div className="flex flex-col gap-2">
            <h1 className="self-center font-medium sm:self-auto">{title}</h1>
            <p className="text-gray-700">{text}</p>
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-start gap-2 sm:flex-row-reverse">
          {children}
        </div>
      </div>
    </ShowModal>
  );
}

export default forwardRef(Alert);
