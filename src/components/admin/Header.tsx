import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import ProfilePic from "../ProfilePic";
import Spinner from "../Spinner";
import ArrowRightOnRectangleIcon from "../icons/ArrowRightOnRectangleIcon";

type Props = {
  user?: Pick<Session["user"], "name" | "email" | "image"> | null;
};

const Header: React.FC<Props> = ({ user }) => {
  return (
    <div className="flex items-center justify-between bg-gold-500 p-2">
      <div className="flex items-center">
        {user ? (
          <>
            <ProfilePic user={user} size="md" />
            <h1 className="ml-4 text-lg font-medium text-blue-700">
              Olá, <span className="font-bold">{user?.name}</span>!
            </h1>
          </>
        ) : (
          <Spinner className="h-12 w-12" />
        )}
      </div>
      <button
        className="rounded-full p-2 text-blue-700 transition-colors hover:bg-white"
        onClick={() => void signOut()}
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Header;
