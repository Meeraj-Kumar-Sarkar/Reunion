const Hero = () => {
  return (
    <div className="py-14 sm:py-20 text-center px-4 animate-slide-up">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-5">
          Support Our{" "}
          <span className="underline decoration-1 underline-offset-6 decoration-neutral-300">Legacy</span>
        </h1>
        <p className="text-base sm:text-lg text-neutral-500 max-w-lg mx-auto leading-relaxed mb-8">
          Join hands with fellow alumni to empower the next generation. Your
          contribution helps us build a stronger future.
        </p>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-black text-xs font-mono tracking-wider uppercase text-black bg-white">
          <span className="w-1.5 h-1.5 bg-black"></span>
          Zero-Fee UPI Payments
        </span>
      </div>
    </div>
  );
};

export default Hero;

