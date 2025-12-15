import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-cyan-neon">404</p>
      <h1 className="font-display text-3xl">This print drifted away.</h1>
      <p className="text-white/60">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="rounded-full border border-cyan-neon px-5 py-3 text-sm font-semibold text-cyan-neon transition hover:bg-cyan-neon hover:text-black"
      >
        Back to home
      </Link>
    </div>
  );
}




