import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Navbar = () => {
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200 transition-all duration-300">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/favicon-32x32.png" alt="Favicon" />
            <span className="text-black font-extrabold tracking-tight text-lg select-none">
              {t("navbarTitle")}{" "}
              <span className="font-light text-neutral-500 transition-colors duration-300 group-hover:text-black">
                {t("navbarSubtitle")}
              </span>
            </span>
          </Link>

          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 border border-neutral-900 font-mono text-xs font-bold transition-all duration-200 hover:bg-neutral-950 hover:text-white cursor-pointer select-none"
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
