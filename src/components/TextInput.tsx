import { classList } from "../utils";

type Props = {
  label: string;
  type?: "text" | "password";
  name?: string;
  className?: string;
  model?: "outline" | "floor";
  error?: string;
  value: string;
  onChange: (e: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  list?: string;
  minLength?: number;
  maxLength?: number;
};

const TextInput: React.FC<Props> = ({
  value,
  type = "text",
  name,
  onChange,
  label,
  className,
  model = "outline",
  error,
  ...props
}) => {
  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <input
          type={type}
          name={name}
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 outline-none ring-0 duration-300 focus:border-blue-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
              "border-red-500 text-red-500": error !== undefined,
            },
          )}
          placeholder=" "
          value={value}
          onChange={e => onChange(e.target.value)}
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

export default TextInput;
