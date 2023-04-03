import { useCallback, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

type Props<T> = {
  placeholder: string;
  className: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  optionToString: (option: T) => string;
  optionToKey: (option: T) => string;
  isDisabled?: (option: T) => boolean;
  isSelected?: (option: T) => boolean;
};

const MultiSelect = <T extends unknown>(props: Props<T>) => {
  const {
    className,
    options,
    selected,
    onChange,
    optionToString,
    optionToKey,
    isDisabled,
    isSelected,
  } = props;

  const [open, setOpen] = useState(false);

  const ref = useDetectClickOutside({ onTriggered: () => setOpen(false) });

  const handleSelect = useCallback(
    (option: T) => {
      if (isDisabled && isDisabled(option)) {
        return;
      }

      if (isSelected && isSelected(option)) {
        onChange(
          selected.filter(selectedOption => optionToKey(option) !== optionToKey(selectedOption)),
        );
      } else {
        onChange([...selected, option]);
      }
    },
    [onChange, selected, isDisabled, isSelected, optionToKey],
  );

  const handleToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

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
          <button type="button" className="absolute inset-0" onClick={handleToggle} />
        </div>
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-max rounded-md bg-white shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {options.map(option => (
              <div
                key={optionToKey(option)}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                onClick={() => handleSelect(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isSelected ? isSelected(option) : selected.includes(option)}
                    disabled={isDisabled ? isDisabled(option) : false}
                  />
                  {optionToString(option)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
