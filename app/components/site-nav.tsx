import Image from "next/image";
import { PLAYLIST } from "@/lib/episodes";

export default function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-line bg-[rgba(22,19,15,0.78)] px-5 py-[14px] backdrop-blur-[14px] sm:gap-6 sm:px-[34px]">
      <a href="#top" className="flex items-center gap-3 text-inherit no-underline">
        <Image
          src="/ferris.png"
          alt="Ferris the crab"
          width={42}
          height={28}
          priority
          className="h-auto w-[42px]"
        />
        <span className="flex flex-col leading-[1.1]">
          <span className="font-display text-[15px] font-semibold text-ink">
            Rust&nbsp;Series
          </span>
          <span className="font-mono text-[11px] tracking-[0.02em] text-muted-2">
            meowy
          </span>
        </span>
      </a>
      <div className="flex items-center gap-2">
        <a
          href="#episodes"
          className="hidden rounded-lg px-3 py-2 font-mono text-[12.5px] text-[#b8ad9d] no-underline transition-colors hover:bg-[#221d18] hover:text-ink sm:inline-block"
        >
          episodes
        </a>
        <a
          href="#resources"
          className="hidden rounded-lg px-3 py-2 font-mono text-[12.5px] text-[#b8ad9d] no-underline transition-colors hover:bg-[#221d18] hover:text-ink sm:inline-block"
        >
          resources
        </a>
        <a
          href={PLAYLIST}
          target="_blank"
          rel="noopener"
          className="ml-1.5 inline-flex items-center gap-[7px] rounded-[9px] bg-accent px-[14px] py-2 font-display text-[13px] font-semibold text-white no-underline transition hover:brightness-110"
        >
          Watch on YouTube
        </a>
      </div>
    </nav>
  );
}
