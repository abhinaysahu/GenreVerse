import { Link, NavLink, useLocation } from "react-router-dom";
import { getUser, clearAuth } from "@/lib/auth";

export default function Header() {
  const { pathname } = useLocation();
  const user = getUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-md dark:bg-black/40 dark:border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-400" />
          <span className="text-xl font-extrabold tracking-tight gradient-text">GenreVerse</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <NavItem to="/" label="Home" active={pathname === "/"} />
          <NavItem to="/dashboard" label="Dashboard" active={pathname.startsWith("/dashboard")} />
          <NavItem to="/analytics" label="Analytics" active={pathname.startsWith("/analytics")} />
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-foreground/80">{user.name}</div>
              <button
                onClick={() => { clearAuth(); window.location.href = "/"; }}
                className="rounded-md border px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground">Sign in</Link>
              <Link to="/register" className="rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={`text-sm font-medium transition-colors ${active ? "text-violet-700" : "text-foreground/70 hover:text-foreground"}`}
    >
      {label}
    </NavLink>
  );
}
