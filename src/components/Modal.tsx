import { forwardRef, type ForwardedRef } from "react";
import { useModal } from "./ModalContext";

type Props = {
  children: React.ReactNode;
  buttons: React.ReactNode;
};

function Modal({ children, buttons }: Props, ref: ForwardedRef<HTMLDivElement>) {
  const ShowModal = useModal();

  return (
    <ShowModal className="bg-black bg-opacity-25">
      <div
        className="m-2 flex max-w-lg flex-col gap-4 rounded-md bg-slate-50 p-6 shadow-md"
        ref={ref}
      >
        <div className="flex flex-col gap-2">{children}</div>
        <div className="flex flex-col items-stretch justify-start gap-2 sm:flex-row-reverse">
          {buttons}
        </div>
      </div>
    </ShowModal>
  );
}

export default forwardRef(Modal);
