import Image from "next/image";
import Spinner from "./Spinner";

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex w-fit flex-col items-center justify-center px-5 text-6xl font-bold">
        <Image alt="logo" src="/logo1.png" width={300} height={223} />
        <Image alt="logo" src="/logo2.png" width={200} height={223} />
      </div>
      <Spinner className="h-48 w-48 fill-blue-600 text-gray-50" />
    </div>
  );
};

export default Loading;
