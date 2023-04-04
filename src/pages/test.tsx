import { useState } from "react";
import Sortable from "../components/SortableList";
import Bars2Icon from "../components/icons/Bars2Icon";
import { classList } from "../utils";

export default function Test() {
  // const [text1, setText1] = useState("");
  // const [text2, setText2] = useState("");
  // const [number1, setNumber1] = useState(0);
  // const [number2, setNumber2] = useState(0);

  // const containerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
    { id: 5, name: "Item 5" },
    { id: 6, name: "Item 6" },
  ]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50">
      {/* <div className="h-24 w-4/5 gap-2">
        <TextInput
          model="floor"
          name="text"
          label="Input"
          value={text1}
          onChange={text => setText1(text)}
          className="box-content bg-slate-50 p-2"
        />
        <TextInput
          model="outline"
          name="text"
          label="Input"
          value={text2}
          onChange={text => setText2(text)}
          className="box-content bg-slate-50 p-2"
        />
        <div className="flex">
          <NumberInput
            model="outline"
            name="text"
            label="Input"
            value={number1}
            onChange={num => setNumber1(num)}
            className="box-content bg-slate-50 p-2"
            min={-10}
            max={10}
            step={0.5}
          />
          <NumberInput
            model="outline"
            name="text"
            label="Input"
            value={number2}
            onChange={num => setNumber2(num)}
            className="box-content bg-slate-50 p-2"
            min={0}
            max={10}
            step={0.25}
          />
        </div>
      </div> */}

      <Sortable.List
        className="flex list-none flex-col gap-2 p-2"
        items={items}
        onChange={setItems}
      >
        {(item, active) => (
          <Sortable.Item
            className={classList("flex flex-row items-center gap-2 rounded-md p-2", {
              "bg-slate-200": active?.id !== item.id,
              "bg-slate-100": active?.id === item.id,
            })}
            id={item.id}
          >
            <Sortable.DragHandle
              className={classList("rounded-full p-2", {
                "bg-slate-400": active?.id !== item.id,
                "bg-slate-300": active?.id === item.id,
              })}
            >
              <Bars2Icon className="h-6 w-6" />
            </Sortable.DragHandle>
            <div>{item.name}</div>
          </Sortable.Item>
        )}
      </Sortable.List>
    </div>
  );
}
