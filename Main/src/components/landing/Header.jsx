import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                to="/login"
                className="landing-btn-sm border border-violet-200 bg-white text-violet-700 shadow-sm hover:bg-violet-50 hover:border-violet-300 transition-all"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="landing-btn-sm bg-linear-to-t from-violet-600 to-violet-500 text-white shadow-sm shadow-violet-500/20 hover:shadow-violet-500/40 hover:from-violet-700 hover:to-violet-600 active:scale-[0.97] transition-all"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
