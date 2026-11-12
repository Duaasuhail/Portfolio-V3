import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "/about" },
] as const;

export default function Home() {
  return (
    <>
      <SiteNav links={navLinks} nameHref={null} />
      <Hero />

      <section id="work" className="projects-section">
        <Projects />
      </section>

      <SiteFooter />
    </>
  );
}
