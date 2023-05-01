import { useModal } from "./ModalContext";

type Props = {
  buttons: React.ReactNode;
  onClickOutside?: React.MouseEventHandler;
  children: React.ReactNode;
};

function Modal({ buttons, onClickOutside, children }: Props) {
  const [, ShowSecondaryModal] = useModal();

  return (
    <ShowSecondaryModal className="z-20 bg-black bg-opacity-25" onClickOutside={onClickOutside}>
      <div className="m-2 flex max-w-lg flex-col gap-4 rounded-md bg-slate-50 p-6 shadow-md">
        <div className="flex flex-col gap-2">{children}</div>
        <div className="flex flex-col items-stretch justify-start gap-2 sm:flex-row-reverse">
          {buttons}
        </div>
      </div>
    </ShowSecondaryModal>
  );
}

export default Modal;
