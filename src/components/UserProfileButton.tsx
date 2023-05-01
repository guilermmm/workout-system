import Link from "next/link";

interface UserProfileButtonProps {
  title: string;
  href: string;
}

const UserProfileButton = ({ title, href }: UserProfileButtonProps) => {
  return (
    <Link
      href={href}
      className="my-1 mx-2 flex w-full max-w-[32rem] flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-md transition-colors hover:bg-blue-600"
    >
      <div className="text-xl">{title}</div>
    </Link>
  );
};

export default UserProfileButton;
