export default function AboutPage() {
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">About Pixo</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">Futuristic print lab</h1>
        <p className="text-sm sm:text-base text-white/65">
          Pixo blends neon cyan energy with minimal, premium layouts. Every poster and polaroid is
          composed for sharp edges, soft corners, and subtle glow—ready for modern workspaces,
          studios, and homes.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl border border-white/10 p-4 sm:p-5 md:p-6">
          <p className="text-xs sm:text-sm font-semibold text-cyan-neon">Principles</p>
          <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/65">
            <li>Minimal composition with bold typography.</li>
            <li>Cyan glow accents without overpowering the frame.</li>
            <li>Micro-interactions that feel smooth and deliberate.</li>
          </ul>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-4 sm:p-5 md:p-6">
          <p className="text-xs sm:text-sm font-semibold text-cyan-neon">Materials</p>
          <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/65">
            <li>Soft 2xl rounded corners on every visual.</li>
            <li>Premium matte texture that plays nicely with neon edges.</li>
            <li>Grid-based layouts to keep balance and clarity.</li>
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon">Aesthetic Display</p>
        <h2 className="mt-2 sm:mt-3 font-display text-xl sm:text-2xl md:text-3xl">Posters &amp; Polaroids that speak</h2>
        <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-white/65">
          From hero walls to shelf moments, Pixo pieces add a cyan note that feels intentional.
        </p>
      </div>

      <div className="glass rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8">
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-neon mb-4">Legal &amp; Policies</p>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl mb-4">Important Information</h2>
        <p className="text-sm sm:text-base text-white/65 mb-6">
          Access our policies, terms, and contact information.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/contact"
            className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-neon hover:text-cyan-neon hover:bg-cyan-neon/10 text-center"
          >
            Contact Us
          </Link>
          <Link
            href="/shipping-policy"
            className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-neon hover:text-cyan-neon hover:bg-cyan-neon/10 text-center"
          >
            Shipping Policy
          </Link>
          <Link
            href="/terms-and-conditions"
            className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-neon hover:text-cyan-neon hover:bg-cyan-neon/10 text-center"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/cancellations-refunds"
            className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-neon hover:text-cyan-neon hover:bg-cyan-neon/10 text-center"
          >
            Cancellations &amp; Refunds
          </Link>
          <Link
            href="/privacy-policy"
            className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-neon hover:text-cyan-neon hover:bg-cyan-neon/10 text-center sm:col-span-2"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

