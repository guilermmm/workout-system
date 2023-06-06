import { useEffect, useState } from "react";
import { classList } from "../utils";

const stringify = (value: Date | null) => {
  if (!value) {
    return "";
  }

  if (isNaN(value.getDate())) {
    return "";
  }

  return value.toISOString().split("T")[0];
};

type Props = {
  label: string;
  className?: string;
  model?: "outline" | "floor";
  error?: string;
  value: Date | null;
  onChange: (e: Date | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  list?: string;
};

const DatePicker = ({
  value,
  onChange,
  label,
  className,
  model = "outline",
  error,
  onBlur,
  ...props
}: Props) => {
  const [dateValue, setDateValue] = useState(stringify(value));

  useEffect(() => {
    const dateString = stringify(value);
    if (dateString !== "") {
      setDateValue(dateString);
    }
  }, [value]);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = e => {
    const dateString = e.target.value;
    const date = new Date(dateString);
    if (isNaN(date.getDate())) {
      onChange(null);
    }
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const dateString = e.target.value;
    const date = new Date(dateString);
    setDateValue(dateString);
    if (!isNaN(date.getDate())) {
      onChange(date);
    }
  };

  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <input
          type="date"
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 outline-none ring-0 duration-300 focus:border-blue-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
              "border-red-500 text-red-500": error !== undefined,
            },
          )}
          placeholder=" "
          value={dateValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        <label
          className={classList(
            "pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform cursor-text bg-inherit px-2 text-sm duration-300 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600",
            {
              "text-red-500": error !== undefined,
              "text-gray-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100":
                error === undefined,
            },
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default DatePicker;
