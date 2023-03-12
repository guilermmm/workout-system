import UserGroupIcon from "./icons/UserGroupIcon";
import ListBulletIcon from "./icons/ListBulletIcon";
import { useRouter } from "next/router";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="flex bg-slate-100 shadow-up">
      <Link href="/" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <UserGroupIcon />
        </div>
        {router.pathname === "/" && <div className="h-1 bg-gold-500" />}
      </Link>
      <Link href="/exercises" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <ListBulletIcon />
        </div>
        {router.pathname.startsWith("/exercises") && <div className="h-1 bg-gold-500" />}
      </Link>
    </nav>
  );
};

export default Navbar;
