import { Link, useNavigate } from "react-router-dom";
import { trpc } from "../trpc";

export default function NavBar() {
  const navigate = useNavigate();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      navigate("/");
    },
  });

  return (
    <div className="navbar bg-base-200 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Flyerscord
        </Link>
      </div>
      <div className="flex-none gap-2">
        {user?.isAdmin && (
          <Link to="/admin/audit-log" className="btn btn-ghost btn-sm">
            Audit Log
          </Link>
        )}
        {user ? (
          <button className="btn btn-ghost btn-sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
