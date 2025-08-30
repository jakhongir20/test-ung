import { Link } from "react-router-dom";
import type { FC } from "react";

interface Props {
  className?: string;
}

export const Header: FC<Props> = () => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block h-6 w-6 rounded bg-cyan-500" />
          <span>TestLUNG</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-cyan-600">Profile</Link>
          <Link to="/test" className="hover:text-cyan-600">Test</Link>
        </nav>
      </div>
    </header>
  );
};
