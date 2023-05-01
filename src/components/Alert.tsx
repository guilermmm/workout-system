import { useModal } from "./ModalContext";

type Props = {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClickOutside?: React.MouseEventHandler;
  children: React.ReactNode;
};

function Alert({ icon, title, text, onClickOutside, children }: Props) {
  const [ShowPrimaryModal] = useModal();

  return (
    <ShowPrimaryModal className="z-30 bg-black bg-opacity-25" onClickOutside={onClickOutside}>
      <div className="m-2 flex max-w-lg flex-col gap-4 rounded-md bg-slate-50 p-6 shadow-md">
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
    </ShowPrimaryModal>
  );
}

export default Alert;
