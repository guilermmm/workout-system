import Spinner from "./Spinner";

type Props = {
  loading: boolean;
  spinnerClassName?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const LoadingButton = ({ loading, spinnerClassName, children, ...props }: Props) => {
  return (
    <button {...props}>
      {loading ? <Spinner className={spinnerClassName} /> : null}
      {children}
    </button>
  );
};
