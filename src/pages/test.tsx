import { useState } from "react";
import Alert from "../components/Alert";
import XMarkIcon from "../components/icons/XMarkIcon";

export default function Test() {
  const [showAlert, setShowAlert] = useState(true);

  const [color, setColor] = useState([0, 0, 0] as [number, number, number]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-100">
      <button
        type="button"
        className="rounded-md bg-slate-50 p-2 shadow-md"
        onClick={() => setShowAlert(true)}
      >
        Abrir
      </button>
      <button
        className="self-end rounded-md bg-slate-50 p-2 shadow-md"
        style={{
          backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
          color: `rgb(${255 - color[0]}, ${255 - color[1]}, ${255 - color[2]})`,
        }}
        onClick={() => {
          const red = Math.floor(Math.random() * 255);
          const green = Math.floor(Math.random() * 255);
          const blue = Math.floor(Math.random() * 255);
          setColor([red, green, blue]);
        }}
      >
        Change
      </button>
      {showAlert && (
        <Alert
          icon={<XMarkIcon className="h-10 w-10 rounded-full bg-red-200 p-2 text-red-500" />}
          title="Deletar"
          text="Tem certeza que deseja deletar?"
          confirmButtonColor="red"
          onCancel={() => setShowAlert(false)}
          onConfirm={() => {
            console.log("a");
            setShowAlert(false);
          }}
        />
      )}
    </div>
  );
}
