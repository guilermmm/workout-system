import { useState } from "react";
import Alert from "../components/Alert";
import MagnifyingGlassIcon from "../components/icons/MagnifyingGlassIcon";
import XMarkIcon from "../components/icons/XMarkIcon";

export default function Test() {
  const [showAlert, setShowAlert] = useState(false);

  const [search, setSearch] = useState("");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-100">
      <div className="relative">
        <input
          type="text"
          className="block h-12 w-full appearance-none rounded-full border-1 pl-4 pr-12 shadow-md outline-none ring-0 focus:outline-none focus:ring-0"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute right-4 top-3 h-6 w-6" />
      </div>

      <button
        type="button"
        className="rounded-md bg-slate-50 p-2 shadow-md"
        onClick={() => setShowAlert(true)}
      >
        Abrir
      </button>

      {showAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-200 p-2 text-red-500" />}
          title="Deletar"
          text="Tem certeza que deseja deletar?"
          onClickOutside={() => setShowAlert(false)}
        >
          <button
            className="rounded-md border-1 bg-red-600 py-2 px-4 text-white shadow-md"
            onClick={() => {
              console.log("a");
              setShowAlert(false);
            }}
          >
            Confirmar
          </button>
          <button
            className="rounded-md border-1 bg-slate-50 py-2 px-4 shadow-md"
            onClick={() => setShowAlert(false)}
          >
            Cancelar
          </button>
        </Alert>
      )}
    </div>
  );
}
