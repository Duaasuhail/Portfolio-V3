import type { Metadata } from "next";
import InterestsCarousel from "@/components/InterestsCarousel";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "About - Duaa Suhail",
  description:
    "Product designer in her final year at York University, designing with the mindset that small decisions make the biggest difference.",
};

const navLinks = [
  { label: "Work", href: "/#work" },
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

const awards = [
  {
    name: "RGD 2026 Student Awards",
    year: "2026",
    detail:
      "Won first place in UX Design from Canada’s largest student design award program for Felt., a 72-hour designathon project created with Richard Lau (awarded $1,000 sponsored by Context Creative).",
  },
  {
    name: "UX Laurier Designathon",
    detail:
      "Nominated for Best Research (2025), Honourable Mention for Best Pitch (2024).",
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
      <SiteNav links={navLinks} currentHref="/about" />

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

            <section className="about-awards" aria-labelledby="awards-heading">
              <h2 id="awards-heading" className="about-section-title">
                Awards
              </h2>
              {awards.map((award) => (
                <div className="about-award" key={award.name}>
                  <div className="about-award-head">
                    <p className="about-award-name">{award.name}</p>
                    {"year" in award ? (
                      <p className="about-award-year">{award.year}</p>
                    ) : null}
                  </div>
                  <p className="about-award-detail">{award.detail}</p>
                </div>
              ))}
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
