import { useCallback, useEffect, useState } from "react";
import { classList, useClickOutside } from "../utils";

type Props<T> = {
  label: string;
  className: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  itemToString: (option: T) => string;
  itemToKey: (option: T) => string;
  disabled?: boolean;
  error?: string;
};

const MultiSelect = <T,>({
  label,
  className,
  options,
  selected,
  onChange,
  itemToString,
  itemToKey,
  disabled,
  error,
}: Props<T>) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const handleSelect = useCallback(
    (option: T) => {
      if (selected.includes(option)) {
        onChange(
          selected.filter(selectedOption => itemToKey(option) !== itemToKey(selectedOption)),
        );
      } else {
        onChange([...selected, option]);
      }
    },
    [onChange, selected, itemToKey],
  );

  return (
    <div className={className} ref={ref}>
      <div className="relative h-full w-full bg-inherit">
        {
          <div className="flex h-full w-full flex-wrap p-1 pt-1.5">
            {selected.map(option => (
              <div
                key={itemToKey(option)}
                className="m-1 flex items-center justify-center rounded-md bg-blue-500 py-1 px-2 text-sm text-white shadow-lg transition-colors hover:bg-blue-600"
              >
                {itemToString(option)}
              </div>
            ))}
          </div>
        }
        <button
          type="button"
          className={classList(
            "absolute inset-0 block h-full w-full cursor-default appearance-none rounded-lg border-1 border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 text-opacity-0 focus:border-blue-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            {
              "border-red-500 ": error !== undefined,
            },
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        />
        <label
          className={classList(
            "pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform bg-inherit px-2 text-sm text-gray-500 duration-300",
            {
              "top-1/2 -translate-y-1/2 scale-100": !open && !selected.length,
              "top-2 -translate-y-4 scale-75 px-2 text-blue-600": open,
              "border-red-500 text-red-600": error !== undefined,
            },
          )}
        >
          {label}
        </label>
        {open && (
          <div className="absolute left-0 top-full z-10 mt-1 w-max rounded-md bg-white shadow-lg">
            <div className="overflow-y-auto">
              {options.map(option => (
                <label
                  key={itemToKey(option)}
                  className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gold-100"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => {
                        if (disabled) {
                          return;
                        }
                        handleSelect(option);
                      }}
                    />
                    <span className="ml-2">{itemToString(option)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
