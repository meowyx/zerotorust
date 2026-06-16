// Content source of truth for the Rust School site.
//
// The episode map, statuses, chapter mappings, Rustlings folders, blurbs and
// reading lists all live here. To update the site as new episodes ship, edit
// this file: change a status, add a `youtube` / `pdf` URL, or append an episode.

export type ResourceLink = { label: string; url: string };
export type EvergreenLink = ResourceLink & { note: string };
export type EpisodeStatus = "shipped" | "scaffolded" | "upcoming";

export type Episode = {
  num: string;
  title: string;
  status: EpisodeStatus;
  latest?: boolean;
  bookCh: string;
  bookTitle: string;
  rustlings: string[];
  teaches: string;
  core: ResourceLink[];
  deeper: ResourceLink[];
  // TODO: swap PLAYLIST for the real per-episode video URL on each shipped episode.
  youtube: string;
  // Companion guide: a printable HTML page served from public/notes/<slug>/.
  // null renders the button as "PDF soon" (disabled) until a guide exists.
  pdf: string | null;
};

export type SeriesHero = {
  headline: string;
  // Intro paragraph. Wrap inline code in `backticks` to render it monospaced.
  intro: string;
  episodes: number;
  bookRange: string;
  // Watch-the-playlist link; omit until the series has a playlist.
  playlist?: string;
};

export type Series = {
  id: string;
  code: string;
  name: string;
  tagline: string;
  state: "active" | "upcoming";
  statusLabel: string;
  hero: SeriesHero;
  // Teaser topics shown for a not-yet-mapped (upcoming) series.
  teasers?: string[];
  episodes: Episode[];
};

export const PLAYLIST =
  "https://www.youtube.com/playlist?list=PLGCUTFFdTmFIgQX1ehjq_wfEc7qMEi6g1";
export const CHANNEL = "https://www.youtube.com/@MeowyTheDev";

// meowy's links, used in the nav and footer.
export const PORTFOLIO = "https://meowy.xyz";
export const LINKEDIN = "https://www.linkedin.com/in/sushmitaaar/";
export const TWITTER = "https://x.com/me256ow";

// Socials shown in the nav (portfolio lives in the Course series section).
export const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: "linkedin", url: LINKEDIN },
  { label: "twitter", url: TWITTER },
];

// localStorage key for the per-series "watched" set (kept stable so existing
// progress survives a redeploy).
export const WATCHED_STORAGE_KEY = "rfz_watched_v2";

type EpisodeSeed = Omit<Episode, "youtube" | "pdf">;

const SERIES_1_SEED: EpisodeSeed[] = [
  {
    num: "01",
    title: "Rust from zero",
    status: "shipped",
    bookCh: "Ch 1–3",
    bookTitle: "Getting Started, Common Programming Concepts",
    rustlings: ["00_intro", "01_variables", "02_functions", "03_if", "04_primitive_types"],
    teaches:
      "The on-ramp: install & toolchain, cargo new vs init, hello world, a deep look at fn main, variables & mutability, scalar & compound types, functions, comments, and control flow.",
    core: [
      { label: "The Book, Ch 1–3: Getting Started", url: "https://doc.rust-lang.org/book/ch01-00-getting-started.html" },
      { label: "Rust by Example: Hello World", url: "https://doc.rust-lang.org/rust-by-example/hello.html" },
      { label: "Rust by Example: Primitives", url: "https://doc.rust-lang.org/rust-by-example/primitives.html" },
      { label: "Rust by Example: Flow of Control", url: "https://doc.rust-lang.org/rust-by-example/flow_control.html" },
    ],
    deeper: [
      { label: "A half-hour to learn Rust, fasterthanlime", url: "https://fasterthanli.me/articles/a-half-hour-to-learn-rust" },
      { label: "The Rust Playground", url: "https://play.rust-lang.org" },
    ],
  },
  {
    num: "02",
    title: "Ownership & the borrow checker",
    status: "shipped",
    bookCh: "Ch 4",
    bookTitle: "Understanding Ownership",
    rustlings: ["06_move_semantics", "04_primitive_types (slices)"],
    teaches:
      "The series' “aha” moment: stack vs heap, the three ownership rules, move semantics, Clone vs Copy, references & borrowing, the borrow checker's rules, slices, and a first glimpse of lifetimes.",
    core: [
      { label: "The Book, Ch 4: Understanding Ownership", url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html" },
      { label: "Rust by Example: Scoping rules", url: "https://doc.rust-lang.org/rust-by-example/scope.html" },
    ],
    deeper: [
      { label: "Common Rust Lifetime Misconceptions, pretzelhammer", url: "https://github.com/pretzelhammer/rust-blog/blob/master/posts/common-rust-lifetime-misconceptions.md" },
    ],
  },
  {
    num: "03",
    title: "Defining your own types",
    status: "shipped",
    bookCh: "Ch 5–6",
    bookTitle: "Structs, Enums and Pattern Matching",
    rustlings: ["07_structs", "08_enums", "12_options"],
    teaches:
      "Model your data: structs (all flavors), impl blocks & methods, &self vs &mut self vs self, enums with data-carrying variants, Option<T> as the answer to null, match exhaustiveness, if let / while let, and a derive teaser.",
    core: [
      { label: "The Book, Ch 5: Using Structs", url: "https://doc.rust-lang.org/book/ch05-00-structs.html" },
      { label: "The Book, Ch 6: Enums and Pattern Matching", url: "https://doc.rust-lang.org/book/ch06-00-enums.html" },
      { label: "Rust by Example: Custom Types", url: "https://doc.rust-lang.org/rust-by-example/custom_types.html" },
    ],
    deeper: [
      { label: "The Book, Ch 18: Patterns and Matching", url: "https://doc.rust-lang.org/book/ch18-00-patterns.html" },
      { label: "std docs: Option", url: "https://doc.rust-lang.org/std/option/enum.Option.html" },
    ],
  },
  {
    num: "04",
    title: "Collections",
    status: "shipped",
    bookCh: "Ch 8",
    bookTitle: "Common Collections",
    rustlings: ["05_vecs", "09_strings", "11_hashmaps"],
    teaches:
      "Vec<T> (push, pop, iterate, capacity), String deeper (bytes vs chars vs graphemes, and why s[0] won't compile), HashMap<K,V> and the entry API, plus common pitfalls like borrow-while-iterating.",
    core: [
      { label: "The Book, Ch 8: Common Collections", url: "https://doc.rust-lang.org/book/ch08-00-common-collections.html" },
      { label: "std::collections overview", url: "https://doc.rust-lang.org/std/collections/index.html" },
    ],
    deeper: [
      { label: "std docs: Vec", url: "https://doc.rust-lang.org/std/vec/struct.Vec.html" },
      { label: "std docs: String", url: "https://doc.rust-lang.org/std/string/struct.String.html" },
      { label: "std docs: HashMap", url: "https://doc.rust-lang.org/std/collections/struct.HashMap.html" },
    ],
  },
  {
    num: "05",
    title: "Error handling",
    status: "shipped",
    bookCh: "Ch 9",
    bookTitle: "Error Handling",
    rustlings: ["13_error_handling", "23_conversions"],
    teaches:
      "panic! vs recoverable errors, a full Result<T, E> walkthrough, the ? operator & propagation, unwrap vs expect (and when each fits), and custom error types with a light thiserror mention. “Errors are values.”",
    core: [
      { label: "The Book, Ch 9: Error Handling", url: "https://doc.rust-lang.org/book/ch09-00-error-handling.html" },
      { label: "thiserror docs", url: "https://docs.rs/thiserror" },
      { label: "anyhow docs", url: "https://docs.rs/anyhow" },
    ],
    deeper: [
      { label: "Error Handling in Rust, BurntSushi", url: "https://blog.burntsushi.net/rust-error-handling/" },
    ],
  },
  {
    num: "06",
    title: "Generics, traits & lifetimes",
    status: "shipped",
    latest: true,
    bookCh: "Ch 10",
    bookTitle: "Generic Types, Traits, and Lifetimes",
    rustlings: ["14_generics", "15_traits", "16_lifetimes", "23_conversions"],
    teaches:
      "Generic functions, structs & enums, traits as interfaces, default impls, trait bounds, lifetime annotations (the full mechanics promised in Ep02), elision rules, 'static, and a dyn Trait teaser.",
    core: [
      { label: "The Book, Ch 10: Generics, Traits, and Lifetimes", url: "https://doc.rust-lang.org/book/ch10-00-generics.html" },
      { label: "Rust by Example: Generics", url: "https://doc.rust-lang.org/rust-by-example/generics.html" },
      { label: "Rust by Example: Traits", url: "https://doc.rust-lang.org/rust-by-example/trait.html" },
    ],
    deeper: [
      { label: "Tour of Rust's Standard Library Traits, pretzelhammer", url: "https://github.com/pretzelhammer/rust-blog/blob/master/posts/tour-of-rusts-standard-library-traits.md" },
      { label: "Crust of Rust: Lifetime Annotations, Jon Gjengset", url: "https://www.youtube.com/results?search_query=crust+of+rust+lifetime+annotations" },
    ],
  },
  {
    num: "07",
    title: "Closures & iterators",
    status: "scaffolded",
    bookCh: "Ch 13",
    bookTitle: "Functional Features: Iterators and Closures",
    rustlings: ["18_iterators"],
    teaches:
      "Closure syntax & capture modes (move, &, &mut), the Fn / FnMut / FnOnce mental model, iterators as the killer feature, adapter chains (map, filter, collect, fold), laziness, and the performance story.",
    core: [
      { label: "The Book, Ch 13: Functional Features", url: "https://doc.rust-lang.org/book/ch13-00-functional-features.html" },
      { label: "std docs: Iterator trait", url: "https://doc.rust-lang.org/std/iter/trait.Iterator.html" },
    ],
    deeper: [
      { label: "Effective Rust, David Drysdale", url: "https://effective-rust.com" },
      { label: "Crust of Rust: Iterators, Jon Gjengset", url: "https://www.youtube.com/results?search_query=crust+of+rust+iterators" },
    ],
  },
  {
    num: "08",
    title: "Project structure: modules + cargo",
    status: "scaffolded",
    bookCh: "Ch 7 + 14",
    bookTitle: "Managing Growing Projects, More about Cargo",
    rustlings: ["10_modules", "22_clippy"],
    teaches:
      "The module tree (package → crate → module), mod / pub / use & paths, file-based modules, a live single-file refactor, Cargo.toml profiles, workspaces, features, fmt & clippy, and publishing to crates.io.",
    core: [
      { label: "The Book, Ch 7: Managing Growing Projects", url: "https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html" },
      { label: "The Book, Ch 14: More about Cargo", url: "https://doc.rust-lang.org/book/ch14-00-more-about-cargo.html" },
      { label: "The Cargo Book", url: "https://doc.rust-lang.org/cargo" },
    ],
    deeper: [
      { label: "Rust's module system, clearly explained, Sheshbabu", url: "https://www.sheshbabu.com/posts/rust-module-system/" },
      { label: "Rust API Guidelines", url: "https://rust-lang.github.io/api-guidelines/" },
    ],
  },
  {
    num: "09",
    title: "Testing",
    status: "upcoming",
    bookCh: "Ch 11",
    bookTitle: "Writing Automated Tests",
    rustlings: ["17_tests"],
    teaches:
      "#[test] & cargo test, the assertion macros, #[should_panic], returning Result from tests, unit tests in mod tests vs integration tests in tests/, and running or ignoring specific tests.",
    core: [
      { label: "The Book, Ch 11: Writing Automated Tests", url: "https://doc.rust-lang.org/book/ch11-00-testing.html" },
      { label: "cargo test reference", url: "https://doc.rust-lang.org/cargo/commands/cargo-test.html" },
    ],
    deeper: [
      { label: "proptest, property-based testing", url: "https://docs.rs/proptest" },
      { label: "insta, snapshot testing", url: "https://docs.rs/insta" },
    ],
  },
  {
    num: "10",
    title: "Smart pointers",
    status: "upcoming",
    bookCh: "Ch 15",
    bookTitle: "Smart Pointers",
    rustlings: ["19_smart_pointers"],
    teaches:
      "Why smart pointers exist, Box<T> (heap, recursive types, trait objects), Rc<T> (shared ownership), RefCell<T> (interior mutability), Rc<RefCell<T>> for graphs & lists, and a quick Deref & Drop mention.",
    core: [
      { label: "The Book, Ch 15: Smart Pointers", url: "https://doc.rust-lang.org/book/ch15-00-smart-pointers.html" },
    ],
    deeper: [
      { label: "Learn Rust With Entirely Too Many Linked Lists", url: "https://rust-unofficial.github.io/too-many-lists/" },
      { label: "std docs: Rc", url: "https://doc.rust-lang.org/std/rc/struct.Rc.html" },
    ],
  },
  {
    num: "11",
    title: "Fearless concurrency",
    status: "upcoming",
    bookCh: "Ch 16",
    bookTitle: "Fearless Concurrency",
    rustlings: ["20_threads", "19_smart_pointers"],
    teaches:
      "thread::spawn, move closures & ownership across threads, channels (mpsc) and message passing, shared state with Mutex<T> & Arc<T>, what Send and Sync really mean, and a parallel work example.",
    core: [
      { label: "The Book, Ch 16: Fearless Concurrency", url: "https://doc.rust-lang.org/book/ch16-00-concurrency.html" },
    ],
    deeper: [
      { label: "Rust Atomics and Locks, Mara Bos (free)", url: "https://marabos.nl/atomics/" },
      { label: "rayon, data parallelism", url: "https://docs.rs/rayon" },
    ],
  },
  {
    num: "12",
    title: "Async Rust (finale)",
    status: "upcoming",
    bookCh: "Ch 17 + beyond",
    bookTitle: "Fundamentals of Asynchronous Programming (2024 ed.)",
    rustlings: [],
    teaches:
      "The finale: async fn & .await and what they desugar to, Futures and laziness, runtimes & why Tokio, Tokio basics, concurrent tasks, a parallel-HTTP demo, streams, common gotchas, and a Series 2 tease.",
    core: [
      { label: "The Book, Ch 17: Async and Await", url: "https://doc.rust-lang.org/book/ch17-00-async-await.html" },
      { label: "The Tokio Tutorial", url: "https://tokio.rs/tokio/tutorial" },
      { label: "Asynchronous Programming in Rust (async book)", url: "https://rust-lang.github.io/async-book/" },
    ],
    deeper: [
      { label: "Crust of Rust: async/await, Jon Gjengset", url: "https://www.youtube.com/results?search_query=crust+of+rust+async+await" },
      { label: "reqwest docs", url: "https://docs.rs/reqwest" },
    ],
  },
];

// Companion guide folders under public/notes/, keyed by episode number.
// Add an entry here when a new episode's guide ships.
const NOTES_SLUG: Record<string, string> = {
  "01": "rust-intro",
  "02": "rust-ownership",
  "03": "rust-structs-enums",
  "04": "rust-collections",
  "05": "rust-error-handling",
  "06": "rust-generics-traits",
};

const series1: Episode[] = SERIES_1_SEED.map((e) => ({
  ...e,
  youtube: PLAYLIST,
  pdf: NOTES_SLUG[e.num] ? `/notes/${NOTES_SLUG[e.num]}/index.html` : null,
}));

export const SERIES: Series[] = [
  {
    id: "s1",
    code: "01",
    name: "Rust from Zero",
    tagline: "From your first cargo new to async Rust.",
    state: "active",
    statusLabel: "Now airing",
    hero: {
      headline: "Rust from zero.",
      intro:
        "A twelve-episode path from your first `cargo new` to async Rust. Every episode pairs the video with a companion guide, the exact book chapter, and the Rustlings drills that build the same muscles.",
      episodes: 12,
      bookRange: "1–17",
      playlist: PLAYLIST,
    },
    episodes: series1,
  },
  {
    id: "s2",
    code: "02",
    name: "Rust Advanced",
    tagline:
      "Macros, unsafe, performance, and real-world systems Rust. Twelve more episodes.",
    state: "upcoming",
    statusLabel: "Upcoming",
    hero: {
      headline: "Rust advanced.",
      intro:
        "Twelve more episodes past the basics: `unsafe`, macros, performance, and the patterns real-world systems Rust is built on. Being mapped out now.",
      episodes: 12,
      bookRange: "18+",
    },
    teasers: [
      "Unsafe Rust & raw pointers",
      "Advanced traits: associated types & coherence",
      "Advanced types: newtypes, DSTs, the never type",
      "Declarative & procedural macros",
      "Writing your own derive macro",
      "Interior mutability & Pin",
      "Custom futures & how executors work",
      "Atomics & lock-free concurrency",
      "FFI: interop with C",
      "no_std & embedded Rust",
      "Performance: profiling & zero-cost abstractions",
      "Capstone: a production-grade service",
    ],
    episodes: [],
  },
];

export const EVERGREEN: EvergreenLink[] = [
  { label: "The Book", url: "https://doc.rust-lang.org/book", note: "The Rust Programming Language, 2024 edition, the spine of the series." },
  { label: "Rustlings", url: "https://github.com/rust-lang/rustlings", note: "Small compile-to-pass exercises by topic. Do them alongside the videos." },
  { label: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example", note: "Runnable examples for every concept." },
  { label: "std docs", url: "https://doc.rust-lang.org/std", note: "Learn to read these early, it pays off every episode." },
  { label: "The Rust Playground", url: "https://play.rust-lang.org", note: "Zero-install experimentation in the browser." },
  { label: "The Cargo Book", url: "https://doc.rust-lang.org/cargo", note: "Relevant from Episode 08 on." },
];

export const FOLLOWUPS: ResourceLink[] = [
  { label: "Effective Rust, David Drysdale", url: "https://effective-rust.com" },
  { label: "pretzelhammer's rust-blog", url: "https://github.com/pretzelhammer/rust-blog" },
  { label: "Crust of Rust series, Jon Gjengset", url: "https://www.youtube.com/results?search_query=jon+gjengset+crust+of+rust" },
];

export const STUDY_LOOP: { n: string; text: string }[] = [
  { n: "1", text: "Watch the episode." },
  { n: "2", text: "Read the matching book chapter for the same topic." },
  { n: "3", text: "Do the matching Rustlings folder(s) in order until everything passes." },
  { n: "4", text: "Rebuild one tiny thing from memory in the Playground, no copy-paste." },
  { n: "5", text: "Only if curious, dip into the “going deeper” links." },
];
