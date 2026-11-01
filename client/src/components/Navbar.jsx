import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const link = "text-sm font-semibold hover:text-brick";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/80 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          haat<span className="text-marigold">.</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/" className={link}>Home</Link>
          {user?.role === "seller" && <Link to="/dashboard" className={link}>My shop</Link>}
          {user?.role === "buyer" && <Link to="/orders" className={link}>My orders</Link>}
          {user?.role !== "seller" && (
            <Link to="/cart" className={link}>
              Cart{count > 0 && <span className="ml-1.5 rounded-full bg-marigold px-2 py-0.5 text-xs">{count}</span>}
            </Link>
          )}
          {user ? (
            <button
              className="btn btn-ghost !py-1.5 text-sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out ({user.name.split(" ")[0]})
            </button>
          ) : (
            <>
              <Link to="/login" className={link}>Log in</Link>
              <Link to="/register" className="btn btn-primary text-sm">Sign up</Link>
            </>
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((enabled) => !enabled)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
            title={`Switch to ${darkMode ? "light" : "dark"} theme`}
          >
            <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
