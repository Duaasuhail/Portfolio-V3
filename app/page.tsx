import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Hero />

      <section id="work" className="projects-section">
        <Projects />
      </section>

      <SiteFooter />
    </>
  );
}
