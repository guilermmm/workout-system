import { useEffect, useState } from "react";
import { classList } from "../utils";

const normalize = (value: string) => {
  // trim leading and trailing whitespace
  value = value.trim();

  if (value === "") {
    return "0";
  }

  // remove leading zeros if followed by a number
  if (value.match(/^0[0-9]/)) {
    value = value.replace(/^0+/, "");
  }

  // assert that the value contains only numbers and commas or dots
  if (!value.match(/^[0-9.,]+$/)) {
    return null;
  }

  // assert that the value contains at the maximum one comma or dot
  const commaOrDot = value.match(/[.,]/g);
  if (commaOrDot && commaOrDot.length > 1) {
    return null;
  }

  // replace dots with commas
  value = value.replace(".", ",");

  return value;
};

const number = (value: string, min?: number, max?: number) => {
  if (value.endsWith(",")) {
    return null;
  }

  let num = parseFloat(value.replace(",", "."));

  if (min) {
    num = Math.max(min, num);
  }

  if (max) {
    num = Math.min(max, num);
  }

  if (isNaN(num)) {
    return null;
  }

  return num;
};

type Props = {
  label: string;
  className?: string;
  model?: "outline" | "floor";
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (e: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
};

const NumberInput: React.FC<Props> = ({
  value,
  onChange,
  label,
  className,
  model = "outline",
  min,
  max,
  step = 1,
  error,
  onBlur,
  ...props
}) => {
  const [numberValue, setNumberValue] = useState(value.toString());

  useEffect(() => {
    const normalized = normalize(value.toString());
    if (normalized !== null) {
      const num = number(normalized, min, max);
      if (num !== null) {
        setNumberValue(normalized);
      }
    }
  }, [value, min, max]);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    const normalized = normalize(e.target.value);
    if (normalized !== null) {
      const num = parseFloat(normalized.replace(",", "."));
      setNumberValue(num.toString().replace(".", ","));
    }
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const value = normalize(e.target.value);

    if (value === null) {
      return;
    }

    setNumberValue(value);

    const num = number(value, min, max);

    if (num === null) {
      return;
    }

    setNumberValue(normalize(num.toString())!);

    onChange(num);
  };

  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <input
          type="text"
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2 pb-1 pt-1.5 text-sm text-gray-900 outline-none ring-0 transition-none duration-300 invalid:border-red-500 invalid:text-red-500 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [&:not(:invalid):focus]:border-blue-600",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
              "border-red-500 text-red-500": error !== undefined,
            },
          )}
          inputMode="decimal"
          placeholder=" "
          value={numberValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          onBlur={handleBlur}
          {...props}
        />
        <label
          className={classList(
            "pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform cursor-text whitespace-nowrap bg-inherit px-2 text-sm duration-300",
            "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
            {
              "text-red-500": error !== undefined,
              "text-gray-500": error === undefined,
            },
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default NumberInput;
