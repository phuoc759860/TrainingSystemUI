import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2" aria-label="TrainingHub">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" className="fill-violet-500 stroke-violet-500" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" className="fill-violet-300 stroke-violet-300" />
      </svg>
      <span className="text-lg font-bold text-gray-900">TrainingHub</span>
    </Link>
  );
}
