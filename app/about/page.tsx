import type { Metadata } from "next";
import Link from "next/link";
import InterestsCarousel from "@/components/InterestsCarousel";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About — Duaa Suhail",
  description:
    "Product designer in her final year at York University, designing with the mindset that small decisions make the biggest difference.",
};

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Gaming", href: "/#gaming" },
  { label: "About", href: "/about" },
] as const;

const work = [
  {
    org: "Databiomes",
    roles: [{ title: "Product Design Intern", year: "2026" }],
  },
  {
    org: "York University",
    roles: [
      { title: "Design, Communication & Marketing Assistant", year: "2026" },
      { title: "Graphic Design & Multimedia Assistant", year: "2025" },
    ],
  },
] as const;

const extras = [
  {
    org: "DESN @ York Gradshow",
    roles: [
      { title: "Class Lead/Project Manager", year: "Present" },
      { title: "Logistics Lead", year: "Present" },
      { title: "Web Designer", year: "Present" },
    ],
  },
  {
    org: "Design Students’ Association",
    roles: [
      { title: "Marketing Director & Lead Product Designer", year: "Present" },
      { title: "Branding Coordinator", year: "2026" },
    ],
  },
  {
    org: "YU Blueprint",
    roles: [{ title: "Product Design Lead", year: "2025" }],
  },
] as const;

function ExperienceColumn({
  label,
  groups,
}: {
  label: string;
  groups: ReadonlyArray<{
    org: string;
    roles: ReadonlyArray<{ title: string; year: string }>;
  }>;
}) {
  return (
    <div className="about-experience-col">
      <p className="about-label">{label}</p>
      <div className="about-entries">
        {groups.map((group) => (
          <div className="about-org" key={group.org}>
            <p className="about-org-name">{group.org}</p>
            {group.roles.map((role) => (
              <div className="about-role" key={role.title}>
                <p>{role.title}</p>
                <p className="about-role-year">{role.year}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-nav page-shell">
        <Link href="/" className="text-nav whitespace-nowrap">
          Duaa Suhail
        </Link>
        <nav className="flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-nav whitespace-nowrap transition-opacity hover:opacity-70"
              aria-current={link.href === "/about" ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="about-body">
        <div className="about-stack">
          <div className="page-shell about-intro-block">
            <section className="about-intro">
              <div className="about-intro-copy">
                <h1 className="about-greeting">Hey I’m Duaa,</h1>
                <div className="about-copy">
                  <p>
                    Currently in my fourth and final year of design school at York
                    University, I’m a product designer who designs with the mindset
                    that any small decision makes the biggest difference (this isn’t
                    about pixels). It’s about the friction removed from an overlooked
                    edge case, the intentionality behind a system architecture, and
                    how a tool actually makes someone feel when they use it. I’ve
                    always been immersed in tech, whether that be coding in Scratch
                    or playing video games on my WII or our gaming PC. I love
                    experimenting and learning new tools every day.
                  </p>
                  <p>
                    Outside of design, I’m frequently playing video games and working
                    on my creative hobbies! Currently, I’m playing Valorant, League
                    of Legends, and The Legend of Zelda: Ocarina of Time. I also love
                    going to concerts, taking photos and creating my own press-on
                    nails from scratch!
                  </p>
                </div>
              </div>
              <div className="about-portrait">
                <img
                  src="/about/portrait.png"
                  alt="Duaa Suhail posing in front of a neon storefront with a giant panda"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </section>

            <section className="about-experience" aria-labelledby="experience-heading">
              <h2 id="experience-heading" className="about-section-title">
                Experience
              </h2>
              <div className="about-experience-cols">
                <ExperienceColumn label="Work" groups={work} />
                <ExperienceColumn label="Extras" groups={extras} />
              </div>
            </section>
          </div>

          <section className="about-interests" aria-labelledby="interests-heading">
            <div className="page-shell about-interests-head">
              <h2 id="interests-heading" className="about-section-title">
                Check out some of my interests outside of design
              </h2>
              <p className="about-interests-aside">Some of my favourite things :)</p>
            </div>
            <InterestsCarousel />
          </section>

          <p className="about-thanks">Thanks for viewing my universe!</p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
