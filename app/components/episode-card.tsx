import type { Episode } from "@/lib/episodes";

type Props = {
  episode: Episode;
  watched: boolean;
  expanded: boolean;
  onToggleWatch: () => void;
  onToggleExpand: () => void;
};

// Static class strings per status so Tailwind can see them at build time.
const STATUS: Record<
  Episode["status"],
  { label: string; dot: string; num: string; badge: string }
> = {
  shipped: {
    label: "Shipped",
    dot: "bg-[#6fb98a]",
    num: "text-accent",
    badge: "text-[#7fbf94] bg-[rgba(111,185,138,0.10)] border-[rgba(111,185,138,0.30)]",
  },
  scaffolded: {
    label: "Scaffolded",
    dot: "bg-[#d6a544]",
    num: "text-body-3",
    badge: "text-[#d6a544] bg-[rgba(214,165,68,0.10)] border-[rgba(214,165,68,0.30)]",
  },
  upcoming: {
    label: "Upcoming",
    dot: "bg-[#6a6053]",
    num: "text-muted-3",
    badge: "text-muted-2 bg-transparent border-[#3a342c]",
  },
};

export default function EpisodeCard({
  episode,
  watched,
  expanded,
  onToggleWatch,
  onToggleExpand,
}: Props) {
  const s = STATUS[episode.status];
  const shipped = episode.status === "shipped";

  return (
    <article className="rounded-2xl border border-line-3 bg-panel px-5 py-5 transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-line-hover hover:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.85)] sm:px-[26px] sm:py-6">
      <div className="flex items-start gap-4 sm:gap-[22px]">
        {/* number */}
        <div className="w-[58px] shrink-0">
          <div className={`font-mono text-[38px] font-semibold leading-none ${s.num}`}>
            {episode.num}
          </div>
        </div>

        {/* main */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="m-0 font-display text-[21px] font-semibold tracking-[-0.01em]">
              {episode.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-[7px] border px-[9px] py-[3px] font-mono text-[11px] tracking-[0.04em] ${s.badge}`}
            >
              <span
                className={`h-[7px] w-[7px] rounded-full ${s.dot} ${
                  shipped ? "animate-dot-pulse" : ""
                }`}
              />
              {s.label}
            </span>
            {episode.latest && (
              <span className="rounded-md border border-[rgba(227,59,38,0.4)] px-[7px] py-0.5 font-mono text-[10.5px] tracking-[0.1em] text-accent">
                LATEST
              </span>
            )}
          </div>

          <div className="mb-3 font-mono text-[12.5px] text-muted">
            Book {episode.bookCh}, {episode.bookTitle}
          </div>
          <p className="m-0 mb-4 max-w-[660px] text-[15.5px] text-body text-pretty">
            {episode.teaches}
          </p>

          <div className="mb-[18px] flex flex-wrap items-center gap-[7px]">
            <span className="mr-0.5 font-mono text-[11px] text-muted-3">rustlings:</span>
            {episode.rustlings.length > 0 ? (
              episode.rustlings.map((folder) => (
                <span
                  key={folder}
                  className="rounded-[7px] border border-line-3 bg-chip px-[9px] py-1 font-mono text-[12px] text-[#c0b6a6]"
                >
                  {folder}
                </span>
              ))
            ) : (
              <span className="font-mono text-[12px] italic text-muted-3">
                none, use the Tokio tutorial drills
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {shipped ? (
              <>
                <a
                  href={episode.youtube}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-[9px] bg-accent px-4 py-[9px] font-display text-[13.5px] font-semibold text-white no-underline transition hover:brightness-110"
                >
                  ▶ Watch
                </a>
                {episode.pdf ? (
                  <a
                    href={episode.pdf}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-[9px] border border-line-4 px-4 py-[9px] font-display text-[13.5px] font-semibold text-ink no-underline transition-colors hover:border-muted-4 hover:bg-[#1e1a15]"
                  >
                    ⤓ Companion PDF
                  </a>
                ) : (
                  <span
                    title="Companion PDF coming soon"
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] border border-dashed border-line-4 px-4 py-[9px] font-display text-[13.5px] font-semibold text-muted-4"
                  >
                    ⤓ PDF soon
                  </span>
                )}
                {episode.slides && (
                  <a
                    href={episode.slides}
                    target="_blank"
                    rel="noopener"
                    title="Open the teaching slide deck in a new tab"
                    className="inline-flex items-center gap-2 rounded-[9px] border border-line-4 px-4 py-[9px] font-display text-[13.5px] font-semibold text-ink no-underline transition-colors hover:border-muted-4 hover:bg-[#1e1a15]"
                  >
                    ▦ Slides
                  </a>
                )}
              </>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] border border-dashed border-line-4 px-4 py-[9px] font-display text-[13.5px] font-semibold text-muted-4">
                ▶ Not yet released
              </span>
            )}

            <button
              onClick={onToggleExpand}
              aria-expanded={expanded}
              className="ml-auto inline-flex cursor-pointer items-center gap-[7px] border-0 bg-transparent px-2 py-[9px] font-mono text-[12.5px] text-[#b8ad9d] transition-colors hover:text-ink"
            >
              {expanded ? "Hide resources ▴" : "Resources ▾"}
            </button>
          </div>
        </div>

        {/* watched toggle */}
        {shipped && (
          <div className="shrink-0">
            <button
              onClick={onToggleWatch}
              aria-pressed={watched}
              className={
                watched
                  ? "inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[9px] border border-[rgba(111,185,138,0.35)] bg-[rgba(111,185,138,0.08)] px-[11px] py-[7px] font-mono text-[11.5px] text-[#7fbf94]"
                  : "inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[9px] border border-line-3 bg-transparent px-[11px] py-[7px] font-mono text-[11.5px] text-muted-2 transition-colors hover:border-muted-4 hover:text-body"
              }
            >
              {watched ? (
                <>
                  <span className="text-[13px]">✓</span> watched
                </>
              ) : (
                <>
                  <span className="inline-block h-3 w-3 rounded-[3px] border-[1.5px] border-muted-4" />{" "}
                  mark
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* expandable resources */}
      {expanded && (
        <div className="mt-5 grid grid-cols-1 gap-7 border-t border-line-2 pt-5 md:grid-cols-2">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-accent">
              Core reading
            </div>
            <div className="flex flex-col gap-[9px]">
              {episode.core.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-baseline gap-2 text-[14px] text-body-2 no-underline transition-colors hover:text-white"
                >
                  <span className="shrink-0 font-mono text-[11px] text-muted-4">↗</span>
                  <span className="border-b border-[#3a342c]">{r.label}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Going deeper
            </div>
            <div className="flex flex-col gap-[9px]">
              {episode.deeper.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-baseline gap-2 text-[14px] text-[#b8ad9d] no-underline transition-colors hover:text-white"
                >
                  <span className="shrink-0 font-mono text-[11px] text-muted-4">↗</span>
                  <span className="border-b border-[#3a342c]">{r.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
