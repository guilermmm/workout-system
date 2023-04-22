import { useModal } from "./Modal";
import { classList, useClickOutside } from "../utils";

type Props = {
  icon: React.ReactNode;
  title: string;
  text: string;
  confirmButtonColor: "red" | "green" | "blue";
  cancelWhenClickOutside?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function Alert({
  icon,
  title,
  text,
  confirmButtonColor,
  cancelWhenClickOutside = true,
  onCancel,
  onConfirm,
}: Props) {
  const ShowModal = useModal();

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (cancelWhenClickOutside) {
      onCancel();
    }
  });

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
          <button
            className={classList("rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md", {
              "bg-blue-600 text-white": confirmButtonColor === "blue",
              "bg-red-600 text-white": confirmButtonColor === "red",
              "bg-green-600 text-white": confirmButtonColor === "green",
            })}
            onClick={onConfirm}
          >
            Confirmar
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </ShowModal>
  );
}
