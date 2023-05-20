import Link from "next/link";
import { useRouter } from "next/router";
import ListBulletIcon from "../icons/ListBulletIcon";
import UserGroupIcon from "../icons/UserGroupIcon";
import ShieldIcon from "../ShieldIcon";

const AdminNavbar = ({ isSuperUser }: { isSuperUser: boolean }) => {
  const router = useRouter();

  return (
    <nav className="flex bg-slate-100 shadow-up">
      <Link href="/dashboard" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <UserGroupIcon className="h-6 w-6" />
        </div>
        {router.pathname === "/dashboard" && <div className="h-1 bg-gold-500" />}
      </Link>
      <Link href="/exercises" className="grow">
        <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
          <ListBulletIcon className="h-6 w-6" />
        </div>
        {router.pathname === "/exercises" && <div className="h-1 bg-gold-500" />}
      </Link>
      {isSuperUser && (
        <Link href="/admin_dashboard" className="grow">
          <div className="mb-4 mt-4 flex grow justify-center text-xl font-medium text-slate-800">
            <ShieldIcon className="h-6 w-6" />
          </div>
          {router.pathname === "/admin_dashboard" && <div className="h-1 bg-gold-500" />}
        </Link>
      )}
    </nav>
  );
};

export default AdminNavbar;
