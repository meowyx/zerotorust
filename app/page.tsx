import SiteNav from "./components/site-nav";
import CourseExplorer from "./components/course-explorer";
import ResourcesSection from "./components/resources-section";
import SiteFooter from "./components/site-footer";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-page"
      style={{
        backgroundImage:
          "radial-gradient(1100px 600px at 78% -8%, rgba(227,59,38,0.10), transparent 60%)",
      }}
    >
      <SiteNav />
      {/* Series rail + hero + episodes live inside the interactive shell.
          The static resources + footer are slotted in as server-rendered
          children so they ship as little JavaScript as possible. */}
      <CourseExplorer>
        <ResourcesSection />
        <SiteFooter />
      </CourseExplorer>
    </div>
  );
}
