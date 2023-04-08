import { classList } from "../utils";

type Props = {
  value: number;
  onChange: (e: number) => void;
  label: string;
  className?: string;
  model: "outline" | "floor";
  min?: number;
  max?: number;
  step?: number;
  suffix?: [React.ReactNode, string];
};

const NumberInput: React.FC<Props> = props => {
  const { value, onChange, label, className, model, min, max, step, suffix } = props;

  return (
    <div className={className}>
      <div className="relative bg-inherit">
        <input
          type="number"
          className={classList(
            "peer block w-full appearance-none border-gray-300 bg-transparent px-2 pb-1 pt-1.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0",
            suffix ? suffix[1] : "",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
            },
          )}
          placeholder=" "
          value={value}
          onChange={e => {
            let num = Number(e.target.value);
            if (min) {
              num = Math.max(min, num);
            }

            if (max) {
              num = Math.min(max, num);
            }

            if (step && num % step !== 0) {
              num = Math.round(num / step) * step;
            }

            onChange(num);
          }}
          autoComplete="off"
          min={min}
          max={max}
          step={step}
        />
        {suffix && (
          <div className="absolute top-0 right-0 flex h-full items-center px-2 font-normal text-gray-500">
            {suffix[0]}
          </div>
        )}

        <label className="pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform bg-inherit px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600">
          {label}
        </label>
      </div>
    </div>
  );
};

export default NumberInput;
