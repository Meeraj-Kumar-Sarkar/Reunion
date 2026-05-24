import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200 transition-all duration-300">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/favicon-32x32.png" alt="Favicon" />
            <span className="text-black font-extrabold tracking-tight text-lg select-none">
              BNGHS GOLDEN JUBILEE{" "}
              <span className="font-light text-neutral-500 transition-colors duration-300 group-hover:text-black">
                CELEBRATION
              </span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
