"use client";

import { useState } from "react";
import Image from "next/image";
import { SERIES, PORTFOLIO, SOCIAL_LINKS, type Series } from "@/lib/episodes";
import EpisodeCard from "./episode-card";
import { useWatched } from "./use-watched";

type Filter = "all" | "shipped" | "upcoming";

export default function CourseExplorer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [activeSeriesId, setActiveSeriesId] = useState("s1");
  const [watched, setWatched] = useWatched();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const active: Series = SERIES.find((s) => s.id === activeSeriesId) ?? SERIES[0];
  const watchedHere = watched[active.id] ?? [];

  const selectSeries = (id: string) => {
    setActiveSeriesId(id);
    setFilter("all");
    setExpanded([]);
  };

  const toggleWatch = (num: string) => {
    const set = new Set(watchedHere);
    if (set.has(num)) set.delete(num);
    else set.add(num);
    setWatched({ ...watched, [active.id]: [...set] });
  };

  const toggleExpand = (num: string) => {
    setExpanded((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const resetProgress = () => {
    setWatched({ ...watched, [active.id]: [] });
  };

  const all = active.episodes;
  const isPlanned = all.length === 0;
  const shippedCount = all.filter((e) => e.status === "shipped").length;
  const watchedCount = all.filter(
    (e) => e.status === "shipped" && watchedHere.includes(e.num),
  ).length;
  const progress = shippedCount
    ? Math.round((watchedCount / shippedCount) * 100)
    : 0;

  const visible = all.filter((e) => {
    if (filter === "shipped") return e.status === "shipped";
    if (filter === "upcoming") return e.status !== "shipped";
    return true;
  });

  const tab = (on: boolean) =>
    `cursor-pointer rounded-lg border-0 px-[14px] py-[7px] font-mono text-[12px] tracking-[0.03em] transition-colors ${
      on ? "bg-[#332c24] text-ink-bright" : "bg-transparent text-muted-2"
    }`;

  return (
    <>
      {/* Course series rail */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-[1080px] px-5 py-5 sm:px-7">
          <div className="mb-[13px] font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
            Course series
          </div>
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-3">
              {SERIES.map((s) => {
                const on = s.id === active.id;
                const dot =
                  s.state === "active" ? "bg-[#6fb98a]" : "bg-[#d6a544]";
                return (
                  <button
                    key={s.id}
                    onClick={() => selectSeries(s.id)}
                    className={`flex min-w-[208px] cursor-pointer flex-col items-start gap-[9px] rounded-[14px] px-[17px] py-[15px] text-left transition-all ${
                      on
                        ? "border border-accent bg-[rgba(227,59,38,0.10)]"
                        : "border border-line-2 bg-chip-inactive"
                    }`}
                  >
                    <div className="flex w-full items-center gap-2.5">
                      <span className="font-mono text-[13px] font-semibold text-accent">
                        S{s.code}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.05em] text-muted">
                        <span className={`h-[7px] w-[7px] rounded-full ${dot}`} />
                        {s.statusLabel}
                      </span>
                    </div>
                    <span className="whitespace-nowrap font-display text-[16.5px] font-semibold text-ink">
                      {s.name}
                    </span>
                  </button>
                );
              })}
              <div className="flex min-w-[158px] items-center justify-center rounded-[14px] border border-dashed border-[#332d25] px-[17px] py-[15px] text-center font-mono text-[12px] leading-[1.4] text-muted-4">
                more series
                <br />
                in the works
              </div>
            </div>

            {/* meowy's links */}
            <div className="flex flex-col items-end gap-2.5">
              <a
                href={PORTFOLIO}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2 rounded-[10px] border border-line-4 px-[15px] py-[9px] font-display text-[13.5px] font-semibold text-ink no-underline transition-colors hover:border-accent hover:bg-[rgba(227,59,38,0.08)] hover:text-accent"
              >
                check out my site
                <span className="text-accent transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
              <div className="flex items-center gap-3.5">
                {SOCIAL_LINKS.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener"
                    className="font-mono text-[11px] text-muted-3 no-underline transition-colors hover:text-accent"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main id="top" className="mx-auto max-w-[1080px] px-5 pb-[90px] sm:px-7">
        {/* Hero */}
        <header className="px-1 pb-11 pt-10 sm:pt-[60px]">
          <div className="mb-11 flex flex-col gap-8 md:flex-row md:flex-wrap md:items-center md:gap-10">
            <div className="w-full md:w-auto md:min-w-[300px] md:flex-1">
              <div className="mb-[22px] font-mono text-[13px] uppercase tracking-[0.16em] text-accent">
                meowy
              </div>
              <h1 className="m-0 mb-[22px] font-display text-[clamp(44px,7vw,86px)] font-bold leading-[0.96] tracking-[-0.03em] text-balance">
                {active.hero.headline}
              </h1>
              <p className="m-0 mb-[34px] max-w-[640px] text-[19px] text-body text-pretty">
                <Intro text={active.hero.intro} />
              </p>
              <div className="flex flex-wrap gap-3">
                {active.hero.playlist && (
                  <a
                    href={active.hero.playlist}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[22px] py-[13px] font-display text-[15px] font-semibold text-white no-underline transition hover:brightness-110"
                  >
                    ▶ &nbsp;Watch the playlist
                  </a>
                )}
                <a
                  href="#episodes"
                  className="inline-flex items-center gap-2 rounded-[11px] border border-line-4 px-[22px] py-[13px] font-display text-[15px] font-semibold text-ink no-underline transition-colors hover:border-muted-4 hover:bg-[#1e1a15]"
                >
                  {active.hero.playlist ? "Browse episodes ↓" : "See the topics ↓"}
                </a>
              </div>
            </div>
            <Image
              src="/ferris.png"
              alt="Ferris the crab"
              width={300}
              height={200}
              priority
              className="h-auto w-[200px] max-w-[55%] shrink-0 self-center md:w-[300px] md:max-w-[40%] md:self-auto"
              style={{
                filter: "drop-shadow(0 20px 30px rgba(227,59,38,0.22))",
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-[14px]">
            <div className="flex flex-wrap gap-2.5">
              <Stat value={String(active.hero.episodes)} label="EPISODES" />
              <Stat value={String(shippedCount)} label="SHIPPED" accent />
              <Stat value={active.hero.bookRange} label="BOOK CH" />
            </div>
            <div className="min-w-[220px] flex-1 rounded-xl border border-line-2 bg-tile px-[18px] py-[14px]">
              <div className="mb-[9px] flex items-baseline justify-between">
                <span className="font-mono text-[11px] tracking-[0.04em] text-muted-2">
                  YOUR PROGRESS
                </span>
                <span className="font-mono text-[12px] text-body">
                  {watchedCount} / {shippedCount} watched
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line-2">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Episodes */}
        <section id="episodes" className="scroll-mt-20">
          <div className="mb-[26px] flex flex-wrap items-end justify-between gap-4 border-b border-line pb-[22px] pt-[18px]">
            <div>
              <h2 className="m-0 font-display text-[30px] font-bold tracking-[-0.02em]">
                {active.name}
              </h2>
              <div className="mt-[5px] font-mono text-[12.5px] text-muted-2">
                {active.tagline}
              </div>
            </div>
            {!isPlanned && (
              <div className="flex items-center gap-[14px]">
                <div className="flex gap-1 rounded-[11px] border border-line-2 bg-[#1a1611] p-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={tab(filter === "all")}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("shipped")}
                    className={tab(filter === "shipped")}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setFilter("upcoming")}
                    className={tab(filter === "upcoming")}
                  >
                    Upcoming
                  </button>
                </div>
                <button
                  onClick={resetProgress}
                  className="cursor-pointer border-0 bg-transparent p-1.5 font-mono text-[11.5px] text-muted-2 underline underline-offset-[3px] transition-colors hover:text-body"
                >
                  reset progress
                </button>
              </div>
            )}
          </div>

          {isPlanned ? (
            <div className="rounded-2xl border border-dashed border-line-4 bg-[repeating-linear-gradient(135deg,transparent,transparent_11px,rgba(255,255,255,0.012)_11px,rgba(255,255,255,0.012)_22px)] px-10 py-12 text-center">
              <div className="mb-[14px] font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                Upcoming series
              </div>
              <div className="mb-3 font-display text-[26px] font-bold">
                {active.name}
              </div>
              <p className="mx-auto my-0 max-w-[480px] text-[15.5px] text-muted text-pretty">
                {active.tagline} Episodes will appear here with the same layout,
                links and progress as Series 01, once they&rsquo;re mapped out.
              </p>

              {active.teasers && active.teasers.length > 0 && (
                <div className="mx-auto mt-9 max-w-[780px]">
                  <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                    Topics on the radar
                  </div>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {active.teasers.map((t) => (
                      <span
                        key={t}
                        className="rounded-[9px] border border-line-3 bg-chip px-[13px] py-[9px] font-mono text-[12.5px] text-body-3"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mx-auto my-0 mt-6 max-w-[520px] text-[12.5px] text-muted-3 text-pretty">
                    Tentative, shaped around the advanced chapters of the Rust
                    book and beyond. Subject to change.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visible.map((ep) => (
                <EpisodeCard
                  key={ep.num}
                  episode={ep}
                  watched={watchedHere.includes(ep.num)}
                  expanded={expanded.includes(ep.num)}
                  onToggleWatch={() => toggleWatch(ep.num)}
                  onToggleExpand={() => toggleExpand(ep.num)}
                />
              ))}
            </div>
          )}
        </section>

        {children}
      </main>
    </>
  );
}

function Intro({ text }: { text: string }) {
  // Render `inline code` segments (wrapped in backticks) in the mono font.
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-ink">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-[96px] rounded-xl border border-line-2 bg-tile px-[18px] py-[13px]">
      <div className={`font-display text-[26px] font-bold ${accent ? "text-accent" : ""}`}>
        {value}
      </div>
      <div className="font-mono text-[11px] tracking-[0.04em] text-muted-2">
        {label}
      </div>
    </div>
  );
}
