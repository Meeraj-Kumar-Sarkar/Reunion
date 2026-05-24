const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto py-8 px-4 transition-all duration-300">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
        <span>
          © {new Date().getFullYear()} BNGHS GOLDEN JUBILEE CELEBRATION. All
          rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
