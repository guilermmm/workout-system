import { classList } from "../utils";

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
  ...props
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    let num = Number(e.target.value);
    if (min) {
      num = Math.max(min, num);
    }

    if (max) {
      num = Math.min(max, num);
    }

    if (num % step !== 0) {
      num = Math.round(num / step) * step;
    }

    onChange(num);
  };

  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <input
          type="number"
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2 pb-1 pt-1.5 text-sm text-gray-900 outline-none ring-0 duration-300 focus:border-blue-600 focus:outline-none focus:ring-0",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
              "border-red-500 text-red-500": error !== undefined,
            },
          )}
          placeholder=" "
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
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
        {error !== undefined && (
          <label className="pointer-events-none absolute left-1 top-1/2 w-max origin-[0] -translate-y-1/2 transform cursor-text bg-inherit px-2 text-sm text-red-500 duration-300">
            {error}
          </label>
        )}
      </div>
    </div>
  );
};

export default NumberInput;
