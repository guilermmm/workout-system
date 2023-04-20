import NumberInput from "../components/NumberInput";
import TextInput from "../components/TextInput";
import { useForm } from "../utils";

export default function Test() {
  const [{ form, isSubmitting, errors }, { handleSubmit }] = useForm({
    initialValues: {
      name: "",
      surname: "",
      age: 0,
    },
    onSubmit: values => console.log(values),
    validators: {
      name: value => {
        if (!value) return "Campo obrigatório";
      },
      surname: value => {
        if (!value) return "Campo obrigatório";
      },
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-100">
      <div className="w-4/5 gap-2 rounded-md bg-slate-50 p-4 shadow-md">
        <form onSubmit={handleSubmit}>
          <TextInput model="floor" label="Nome" className="bg-slate-50 p-2" {...form.name} />
          <TextInput label="Sobrenome" className="bg-slate-50 p-2" {...form.surname} />
          <NumberInput label="Idade" className="bg-slate-50 p-2" min={0} {...form.age} />
          <button type="submit" className="" disabled={errors !== undefined || isSubmitting}>
            {isSubmitting ? "Enviando" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
