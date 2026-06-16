import { EVERGREEN, FOLLOWUPS, STUDY_LOOP } from "@/lib/episodes";

export default function ResourcesSection() {
  return (
    <section id="resources" className="mt-16 scroll-mt-20">
      <h2 className="m-0 mb-1.5 font-display text-[30px] font-bold tracking-[-0.02em]">
        Resources for every episode
      </h2>
      <p className="m-0 mb-7 font-mono text-[12.5px] text-muted-2">
        Bookmark these once, they apply across the whole series.
      </p>

      <div className="grid grid-cols-1 items-start gap-[18px] md:grid-cols-2">
        {/* Evergreen */}
        <div className="rounded-2xl border border-line-3 bg-panel px-5 py-6 sm:px-[26px]">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
            Evergreen
          </div>
          <div className="flex flex-col gap-[13px]">
            {EVERGREEN.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener"
                className="flex flex-col gap-0.5 text-inherit no-underline transition-opacity hover:opacity-80"
              >
                <span className="text-[15px] font-semibold text-[#e7ddcf]">
                  {r.label}{" "}
                  <span className="text-[12px] font-normal text-muted-4">↗</span>
                </span>
                <span className="text-[13px] text-muted-2">{r.note}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-2xl border border-line-3 bg-panel px-5 py-6 sm:px-[26px]">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              After Series 1
            </div>
            <div className="flex flex-col gap-[11px]">
              {FOLLOWUPS.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-baseline gap-2 text-[14.5px] text-body-2 no-underline transition-colors hover:text-white"
                >
                  <span className="shrink-0 font-mono text-[11px] text-muted-4">↗</span>
                  <span className="border-b border-[#3a342c]">{r.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line-3 bg-[linear-gradient(180deg,#221d17,#1d1914)] px-5 py-6 sm:px-[26px]">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Study loop, per episode
            </div>
            <div className="flex flex-col gap-3">
              {STUDY_LOOP.map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border border-[#3f382f] bg-[#2c2620] font-mono text-[11px] text-accent">
                    {s.n}
                  </span>
                  <span className="text-[14.5px] text-body-3">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
