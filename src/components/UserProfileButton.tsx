import Link from "next/link";

interface UserProfileButtonProps {
  title: string;
  href: string;
}

const UserProfileButton = ({ title, href }: UserProfileButtonProps) => {
  return (
    <Link
      href={href}
      className="flex min-w-fit flex-col justify-center rounded-md bg-blue-500 py-3 px-6 text-center text-white shadow-lg transition-colors hover:bg-blue-600"
    >
      <div>{title}</div>
    </Link>
  );
};

export default UserProfileButton;
