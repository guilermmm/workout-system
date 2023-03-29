import Link from "next/link";
import { useRouter } from "next/router";
import ListBulletIcon from "./icons/ListBulletIcon";
import ProfileIcon from "./icons/ProfileIcon";

const Navbar = () => {
  const router = useRouter();
  console.log();

  return (
    <nav className="flex bg-slate-100 shadow-up">
      <Link href="/home" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <ListBulletIcon className="h-6 w-6" />
        </div>
        {router.pathname.startsWith("/home") && <div className="h-1 bg-gold-500" />}
      </Link>
      <Link href="/profile" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <ProfileIcon className="h-6 w-6" />
        </div>
        {router.pathname.startsWith("/profile") && <div className="h-1 bg-gold-500" />}
      </Link>
    </nav>
  );
};

export default Navbar;
