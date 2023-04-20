// create a dropdown component with the same style as the MultiSelect component
//
// Path: src/components/Dropdown.tsx
// Compare this snippet from src/components/MultiSelect.tsx:

import { useEffect, useState } from "react";
import { useOutsideClick } from "../utils";

type Props<T> = {
  className: string;
  options: T[];
  onSelect: (option: T) => void;
  itemToString: (option: T) => string;
  itemToKey: (option: T) => string;
  children: (isOpen: boolean, toggle: () => void) => React.ReactNode;
  disabled?: boolean;
};

const Dropdown = <T,>({
  className,
  options,
  onSelect,
  itemToString,
  itemToKey,
  children,
  disabled,
}: Props<T>) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false));

  return (
    <div className={className} ref={ref}>
      <div className="relative h-full w-full bg-inherit">
        {children(open, () => {
          if (disabled) {
            return;
          }
          setOpen(o => !o);
        })}
        {open && (
          <div className="absolute left-0 top-full z-10 mt-1 w-max rounded-md bg-white shadow-lg">
            <div className="overflow-y-auto">
              {options.map(option => (
                <button
                  key={itemToKey(option)}
                  className="flex items-center px-4 py-2 text-sm hover:bg-gold-100"
                  onClick={() => {
                    if (disabled) {
                      return;
                    }
                    onSelect(option);
                  }}
                >
                  {itemToString(option)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
