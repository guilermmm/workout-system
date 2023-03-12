import Spinner from "./Spinner";

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
      </div>
      <Spinner />
    </div>
  );
};

export default Loading;
