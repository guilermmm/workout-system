import { useCallback, useState } from "react";
import { useOutsideClick } from "../utils";

type Props<T> = {
  placeholder: string;
  className: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  optionToString: (option: T) => string;
  optionToKey: (option: T) => string;
};

const MultiSelect = <T extends unknown>(props: Props<T>) => {
  const { className, options, selected, onChange, optionToString, optionToKey } = props;

  const [open, setOpen] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false));

  const handleSelect = useCallback(
    (option: T) => {
      if (selected.includes(option)) {
        onChange(
          selected.filter(selectedOption => optionToKey(option) !== optionToKey(selectedOption)),
        );
      } else {
        onChange([...selected, option]);
      }
    },
    [onChange, selected, optionToKey],
  );

  return (
    <div className="relative w-max" ref={ref}>
      <div className={className}>
        <div className="self-start justify-self-start">
          {selected.length ? (
            <div className="flex flex-wrap">
              {selected.map(option => (
                <div
                  key={optionToKey(option)}
                  className="m-1 flex items-center justify-center rounded-md bg-blue-500 py-1 px-2 text-sm text-white shadow-lg transition-colors hover:bg-blue-600"
                >
                  {optionToString(option)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-md py-1 px-2 text-sm text-gray-500">
              {props.placeholder}
            </div>
          )}
          <button type="button" className="absolute inset-0" onClick={() => setOpen(!open)} />
        </div>
      </div>
      {open && (
        <div className="absolute left-0 right-0 z-10 mt-1 w-max rounded-md bg-white shadow-lg">
          <div className="max-h-72 overflow-y-auto">
            {options.map(option => (
              <label
                key={optionToKey(option)}
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gold-100"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleSelect(option)}
                  />
                  <span className="ml-2">{optionToString(option)}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
