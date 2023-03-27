import Spinner from "./Spinner";

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
      </div>
      <Spinner className="h-48 w-48 fill-blue-500 text-gray-50" />
    </div>
  );
};

export default Loading;
