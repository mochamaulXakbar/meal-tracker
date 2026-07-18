import bgPage from '../../assets/contoh_background.png';

export default function PageBackdrop({ children }) {
  return (
    <main className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8 sm:px-6">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgPage})` }}
      />
      <div className="absolute inset-0 -z-10 bg-black/10" />
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-2xl backdrop-blur-md sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
