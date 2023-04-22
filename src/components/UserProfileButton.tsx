import Link from "next/link";

interface UserProfileButtonProps {
  title: string;
  href: string;
}

const UserProfileButton = ({ title, href }: UserProfileButtonProps) => {
  return (
    <Link
      href={href}
      className="m-2 flex min-w-fit flex-col justify-center rounded-md bg-blue-500 py-6 px-9 text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div className="text-xl">{title}</div>
    </Link>
  );
};

export default UserProfileButton;
