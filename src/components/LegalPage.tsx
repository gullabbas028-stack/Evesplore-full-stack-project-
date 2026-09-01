export default function LegalPage({ title, sections }: { title: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-2">{title}</h1>
      <p className="text-slate-500 text-sm mb-8">Last updated: January 2026</p>
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold text-white mb-2">{s.h}</h2>
            <p className="text-slate-400 leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
