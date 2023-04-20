import { useState } from "react";
import { useModal } from "../components/ModalProvider";
import NumberInput from "../components/NumberInput";
import TextInput from "../components/TextInput";
import { useForm } from "../utils";

export default function Test() {
  const [, ShowModal] = useModal();
  const [showModal, setShowModal] = useState(false);

  const [{ form, isSubmitting }, { handleSubmit }] = useForm({
    initialValues: {
      name: "",
      surname: "",
      age: 0,
    },
    onSubmit: values => {
      console.log(values);
      setShowModal(false);
    },
    validators: {
      // name: value => {
      //   if (!value) return "Campo obrigatório";
      // },
      // surname: value => {
      //   if (!value) return "Campo obrigatório";
      // },
    },
  });

  const [color, setColor] = useState([0, 0, 0] as [number, number, number]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-100">
      <button
        type="button"
        className="rounded-md bg-slate-50 p-2 shadow-md"
        onClick={() => setShowModal(true)}
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
      {showModal && (
        <ShowModal className="bg-black bg-opacity-30">
          <div className="flex h-1/2 w-3/5 items-center justify-center rounded-md bg-slate-50 p-4 shadow-md">
            <button
              className="rounded-md bg-slate-50 p-2 shadow-md"
              onClick={() => setShowModal(false)}
            >
              Fechar
            </button>
          </div>
        </ShowModal>
      )}
    </div>
  );
}
