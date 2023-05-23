import { useState } from "react";
import { api } from "../utils/api";

const Test = () => {
  const [b64, setB64] = useState("");
  const create = api.exercise.create.useMutation();

  const img = api.exercise.getExerciseImageById.useQuery({ id: "clhzlvenw0002j1ic3qhwbmxs" });

  return (
    <div>
      <input
        type="file"
        onChange={e => {
          const reader = new FileReader();

          reader.onload = () => {
            setB64(reader.result! as string);
          };

          reader.readAsDataURL(e.target.files![0]!);
        }}
      />

      {img.data && <img src={img.data} alt="" />}
      <button
        onClick={() => {
          create.mutate({ name: "teste", category: "fodas", image: b64 });
        }}
      >
        butao
      </button>
    </div>
  );
};

export default Test;
