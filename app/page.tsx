import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

// Ample cream between the cloud edge and the project cards
const WHITE_BEFORE_PROJECTS_VH = 64;

export default function Home() {
  return (
    <>
      <Hero />

      <section
        id="work"
        className="relative z-10 min-h-screen text-sky-deep"
        style={{
          paddingTop: `${WHITE_BEFORE_PROJECTS_VH}vh`,
          backgroundColor: "var(--surface)",
          backgroundImage:
            "radial-gradient(var(--dot-grid) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="pb-24">
          <Projects />
        </div>
      </section>
    </>
  );
}
