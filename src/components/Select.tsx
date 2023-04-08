import { classList } from "../utils";

type Props = {
  label: string;
  className: string;
  model: "outline" | "floor";
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  defaultValue?: string;
  children: React.ReactNode;
};

const Select = ({ label, className, model, children, ...props }: Props) => {
  return (
    <div className={className}>
      <div className="relative h-full w-full bg-inherit">
        <select
          className={classList(
            "peer block h-full w-full appearance-none border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0",
            {
              "rounded-lg border-1": model === "outline",
              "border-b-2": model === "floor",
            },
          )}
          {...props}
        >
          {children}
        </select>
        <label className="pointer-events-none absolute top-2 left-1 origin-[0] -translate-y-4 scale-75 transform cursor-text bg-inherit px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600">
          {label}
        </label>
      </div>
    </div>
  );
};

export default Select;
