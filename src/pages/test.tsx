import { useState } from "react";
import NumberInput from "../components/NumberInput";

const Test = () => {
  const [number, setNumber] = useState(0);

  return (
    <div className="flex h-full items-center justify-center">
      <NumberInput value={number} onChange={setNumber} label="test" min={5} max={10} />
    </div>
  );
};

export default Test;
