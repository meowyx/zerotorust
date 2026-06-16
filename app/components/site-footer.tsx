import { CHANNEL, SOCIAL_LINKS } from "@/lib/episodes";

const FOOTER_LINKS = [...SOCIAL_LINKS, { label: "youtube", url: CHANNEL }];

export default function SiteFooter() {
  return (
    <footer className="mt-[70px] flex flex-wrap items-center justify-between gap-[14px] border-t border-line pt-7">
      <span className="font-mono text-[12px] text-muted-3">
        A living companion to the Rust&nbsp;series, by meowy
      </span>
      <div className="flex flex-wrap items-center gap-4">
        {FOOTER_LINKS.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener"
            className="font-mono text-[12px] text-[#b8ad9d] no-underline transition-colors hover:text-accent"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </footer>
  );
}
