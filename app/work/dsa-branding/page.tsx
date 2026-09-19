import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DSA 2026–2027 Branding — Duaa Suhail",
  description:
    "A one-week visual identity, narrative, and design system for York University’s Design Students’ Association.",
};

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Gaming", href: "/#gaming" },
  { label: "About", href: "/#about" },
] as const;

type CaseImageProps = {
  src: string;
  alt: string;
  className: string;
  sizes: string;
  priority?: boolean;
  crop?: "wide" | "tall" | "id";
};

function CaseImage({
  src,
  alt,
  className,
  sizes,
  priority,
  crop,
}: CaseImageProps) {
  const image = (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
  );

  return (
    <div className={`case-study-media ${className}`}>
      {crop ? <div className={`case-study-crop case-study-crop--${crop}`}>{image}</div> : image}
    </div>
  );
}

export default function DsaBrandingCaseStudy() {
  return (
    <div className="case-study">
      <header className="case-study-nav page-shell flex items-center justify-between">
        <Link href="/" className="text-nav whitespace-nowrap">
          Duaa Suhail
        </Link>
        <nav className="flex items-center gap-12">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-nav whitespace-nowrap transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="case-study-main">
        <div className="case-study-content">
          <div className="case-study-story">
            <div className="case-study-research">
              <div className="case-study-values-wrap">
                <div className="case-study-context">
                  <div className="case-study-hero-overview">
                    <section className="case-study-hero">
                      <div className="case-study-hero-intro">
                        <h1 className="case-study-h1">
                          I took on the responsibility of designing a fresh new
                          visual identity for the Design Students’ Association
                          (DSA) in under a week.
                        </h1>
                        <div className="case-study-copy case-study-copy--muted">
                          <p>
                            With a sudden team change leaving the DSA without a
                            new brand identity a week before launch, I took the
                            initiative and task to create a full visual
                            identity, narrative, and design system from scratch.
                          </p>
                          <p className="mt-[22.5px]">
                            I did a branding project with the mind of a product
                            designer.
                          </p>
                        </div>
                      </div>

                      <CaseImage
                        src="/projects/dsa/hero.png"
                        alt="DSA wordmark on a blue field"
                        className="case-study-media--hero"
                        sizes="100vw"
                        priority
                      />

                      <div className="case-study-summary">
                        <p className="case-study-copy case-study-copy--ink">
                          Design Student Association 2026 - 2027 Rebrand
                        </p>
                        <div className="case-study-meta">
                          <div className="case-study-meta-col">
                            <div className="case-study-meta-item">
                              <h2 className="case-study-h2 case-study-h2--meta">
                                Role
                              </h2>
                              <p className="case-study-copy case-study-copy--muted">
                                Branding Coordinator &amp; Marketing Director
                              </p>
                            </div>
                            <div className="case-study-meta-item">
                              <h2 className="case-study-h2 case-study-h2--meta">
                                Tools
                              </h2>
                              <p className="case-study-copy case-study-copy--muted">
                                Figma, After Effects, Illustrator
                              </p>
                            </div>
                          </div>
                          <div className="case-study-meta-col">
                            <div className="case-study-meta-item">
                              <h2 className="case-study-h2 case-study-h2--meta">
                                Timeline
                              </h2>
                              <p className="case-study-copy case-study-copy--muted">
                                June - July 2026 (1 week)
                              </p>
                            </div>
                            <div className="case-study-meta-item">
                              <h2 className="case-study-h2 case-study-h2--meta">
                                Disciplines
                              </h2>
                              <p className="case-study-copy case-study-copy--muted">
                                Brand Strategy, Visual Identity, Iconography,
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="case-study-section case-study-overview">
                      <p className="case-study-label">Overview</p>
                      <h2 className="case-study-h2">
                        DSA is York University&apos;s creative collective
                        empowering the next generation of student designers.
                      </h2>
                      <div className="case-study-overview-body case-study-copy case-study-copy--muted">
                        <p>
                          The DSA is a student-led association for students in
                          the Design at York University to interact, learn and
                          grow by providing the resources and skills to bridge
                          the gap between the academic and industry and/or
                          professional fields in the interest of students&apos;
                          post-graduation careers.
                        </p>
                        <p>
                          Every year, the Design Students’ Association (DSA)
                          launches a brand-new visual identity to reflect that
                          specific student executive team and era. The Design
                          Students’ Association operates as a two-sided platform
                          connecting two audiences with opposing needs and
                          mental models:
                        </p>
                      </div>
                    </section>
                  </div>

                  <section className="case-study-audiences">
                    <div className="case-study-audience">
                      <div className="case-study-audience-intro">
                        <h2 className="case-study-h2">
                          Primary and secondary audiences (it’s not just
                          students)
                        </h2>
                        <div className="case-study-audience-desc">
                          <p className="case-study-copy case-study-copy--ink">
                            The Student Design Community
                          </p>
                          <p className="case-study-copy case-study-copy--muted">
                            Design students of all years seeking community,
                            skill-building, and relief from academic pressure.
                          </p>
                        </div>
                      </div>

                      <div className="case-study-split">
                        <div className="case-study-lists case-study-copy case-study-copy--ink">
                          <p>Goals:</p>
                          <ul>
                            <li>
                              Connect with peers, find mentors, and feel part of
                              a welcoming creative community.
                            </li>
                            <li>
                              Build an industry-ready portfolio without feeling
                              overwhelmed by competition.
                            </li>
                            <li>
                              Have fun and express their individual creativity
                              outside of rigid course rubrics.
                            </li>
                          </ul>
                          <p>Likes:</p>
                          <ul>
                            <li>
                              nostalgia (stickers, retro aesthetics, vintage
                              print culture).
                            </li>
                            <li>
                              Low-stakes environments where they can experiment
                              without fear of failure.
                            </li>
                            <li>
                              Scannable, transparent communication about events
                              and resources.
                            </li>
                          </ul>
                          <p>Needs:</p>
                          <ul>
                            <li>
                              A welcoming brand that lowers imposter syndrome
                              and academic burnout.
                            </li>
                            <li>
                              Clear, friction-free event details and accessible
                              design touchpoints.
                            </li>
                            <li>
                              Visuals that make them feel like designers again,
                              not just students chasing grades and internships.
                            </li>
                          </ul>
                        </div>
                        <figure className="case-study-photo">
                          <CaseImage
                            src="/projects/dsa/first-year-jam.png"
                            alt="Students collaborating around tables at DSA’s first-year jam"
                            className="case-study-media--photo"
                            sizes="(max-width: 1024px) 100vw, 746px"
                          />
                          <figcaption className="case-study-caption">
                            DSA’s annual first-year jam
                          </figcaption>
                        </figure>
                      </div>
                    </div>

                    <div className="case-study-audience">
                      <div className="case-study-audience-intro">
                        <p className="case-study-copy case-study-copy--ink">
                          The Industry
                        </p>
                        <p className="case-study-copy case-study-copy--muted">
                          Recruiters, design leaders, agency partners, studios,
                          and corporate sponsors looking for emerging talent.
                        </p>
                      </div>

                      <div className="case-study-split">
                        <div className="case-study-lists case-study-lists--industry case-study-copy case-study-copy--ink">
                          <p>Goals:</p>
                          <ul>
                            <li>
                              Identify high-potential design talent and sponsor
                              impactful student initiatives.
                            </li>
                            <li>
                              Evaluate how well the program prepares students
                              for real-world production standards.
                            </li>
                            <li>
                              Partner with an organized, professional student
                              association.
                            </li>
                          </ul>
                          <p>Likes:</p>
                          <ul>
                            <li>
                              High production value, sharp visual hierarchy, and
                              polished execution.
                            </li>
                            <li>
                              Strong system thinking (tokens, accessibility,
                              scalability, grid mechanics).
                            </li>
                            <li>
                              Student organizations that run like well-oiled
                              product teams.
                            </li>
                          </ul>
                          <p>Needs:</p>
                          <ul>
                            <li>
                              A brand that signals students understand modern
                              design systems and craft.
                            </li>
                            <li>
                              High-density, scannable metadata for sponsorship
                              decks and event promos.
                            </li>
                            <li>
                              A consistent, professional presence that reflects
                              well on external partners.
                            </li>
                          </ul>
                        </div>
                        <figure className="case-study-photo">
                          <CaseImage
                            src="/projects/dsa/microsoft-vancouver.png"
                            alt="York design students touring Microsoft Vancouver"
                            className="case-study-media--photo"
                            crop="wide"
                            sizes="(max-width: 1024px) 100vw, 745px"
                          />
                          <figcaption className="case-study-caption">
                            DESN Students Touring Microsoft Vancouver
                          </figcaption>
                        </figure>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="case-study-values">
                  <h2 className="case-study-h2">Pre-existing brand values</h2>
                  <div className="case-study-values-grid">
                    <article className="case-study-value">
                      <div className="case-study-value-copy">
                        <h3 className="case-study-h2">Creative + Fun</h3>
                        <p className="case-study-copy case-study-copy--muted">
                          DSA represents our unique student culture and
                          community, creating welcoming spaces and initiatives
                          that encourage active student engagement.
                        </p>
                      </div>
                      <CaseImage
                        src="/projects/dsa/value-creative.png"
                        alt="DSA members working together around a table"
                        className="case-study-media--value"
                        sizes="(max-width: 1024px) 100vw, 450px"
                      />
                    </article>
                    <article className="case-study-value">
                      <div className="case-study-value-copy">
                        <h3 className="case-study-h2">
                          Collaborative + Inclusive
                        </h3>
                        <p className="case-study-copy case-study-copy--muted">
                          Mentorship and Events will actively pursue new
                          partnership opportunities, connecting with student
                          clubs, industry professionals, and creative studios to
                          expand our network.
                        </p>
                      </div>
                      <CaseImage
                        src="/projects/dsa/value-collaborative.png"
                        alt="Students gathered together in a collaborative workshop"
                        className="case-study-media--value"
                        crop="tall"
                        sizes="(max-width: 1024px) 100vw, 450px"
                      />
                    </article>
                    <article className="case-study-value">
                      <div className="case-study-value-copy">
                        <h3 className="case-study-h2">Empowering + Bold</h3>
                        <p className="case-study-copy case-study-copy--muted">
                          DSA will be pushing more events. Because we are new to
                          the game, we need to leave a lasting impression to
                          build long-term partnerships and keep the club
                          growing.
                        </p>
                      </div>
                      <CaseImage
                        src="/projects/dsa/value-empowering.png"
                        alt="A large group of DSA members posing together"
                        className="case-study-media--value"
                        sizes="(max-width: 1024px) 100vw, 450px"
                      />
                    </article>
                  </div>
                </section>
              </div>

              <section className="case-study-thinking">
                <div className="case-study-thinking-copy">
                  <p className="case-study-copy case-study-copy--dim">
                    Design Thinking
                  </p>
                  <h2 className="case-study-h2">The core philosophy</h2>
                  <div className="case-study-overview-body case-study-copy case-study-copy--muted">
                    <p>
                      My concept for this year is to bring back the fun and
                      nostalgia of design by reviving iconic elements from past
                      DSA brands (starting with the physically connected logo
                      from 2010) and systematizing them into a fresh, expressive
                      visual identity for the 2026/2027 year. As well as using
                      colours and icons to help remind people why they got into
                      design in the first place!
                    </p>
                    <p>
                      One of the biggest things was that instead of inventing
                      abstract, disconnected motifs for this year’s rebrand, I
                      looked back at the evolution of DSA’s visual history and
                      decided to create an icon system. The flower represents
                      students, and the 4-point star represents events
                      (especially since we started using Luma this year).
                    </p>
                  </div>
                </div>

                <CaseImage
                  src="/projects/dsa/dsa-mockup.png"
                  alt="DSA wordmark on a tote bag, laptop, mug, and phone"
                  className="case-study-media--mockup"
                  sizes="100vw"
                />

                <div className="case-study-thinking-copy">
                  <h2 className="case-study-h2">
                    Countering academic pressure and design fatigue
                  </h2>
                  <div className="case-study-overview-body case-study-copy case-study-copy--muted">
                    <p>
                      When we first start out as kids, design is pure
                      experimentation and fun. As we get older, we slowly become
                      leashed to the strict guidelines provided in studios or
                      corporate companies. Students in design programs
                      especially face a lot of imposter syndrome and lack of
                      motivation because someone you know is always better than
                      you.
                    </p>
                    <p>
                      I wanted to lean into nostalgic reminders like the bright
                      primary colours, custom (fun) icons and the warm retro
                      colour harmonies. Creating a visual identity where people
                      feel like it’s a safe space to experiment and fail. I
                      wanted to bring the fun and passion back to design, which
                      a lot of students experience throughout their journey.
                    </p>
                    <p>
                      At the end of the day, we’re still students, not industry
                      professionals (yet).
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className="case-study-visual">
              <div className="case-study-visual-col case-study-visual-col--left">
                <div className="case-study-visual-copy">
                  <h2 className="case-study-h2">
                    The connected wordmark (homage to our old sister program):
                  </h2>
                  <p className="case-study-copy case-study-copy--muted">
                    DSA hasn’t used a physically connected wordmark since 2010.
                    For this year’s brand identity, I restored the connected
                    ribbon geometry as a literal symbol of community, legacy,
                    and bridging students to industry.
                  </p>
                </div>
                <CaseImage
                  src="/projects/dsa/connected-wordmark.png"
                  alt="Connected DSA wordmark on a blue grid with flower motifs"
                  className="case-study-media--visual"
                  sizes="(max-width: 1024px) 100vw, 746px"
                />
              </div>
              <div className="case-study-visual-col case-study-visual-col--right">
                <div className="case-study-visual-copy">
                  <h2 className="case-study-h2">
                    Nostalgic vibes blending with clean UX:
                  </h2>
                  <p className="case-study-copy case-study-copy--muted">
                    Underneath the playful surface, I created a strict grid
                    system, accessible colour tokens, and clean UI mechanics to
                    prove our work is grounded in modern design standards and is
                    moving the DSA towards the future.
                  </p>
                </div>
                <CaseImage
                  src="/projects/dsa/instagram-mockups.png"
                  alt="DSA Instagram post mockups on a phone and in a browser"
                  className="case-study-media--visual"
                  sizes="(max-width: 1024px) 100vw, 746px"
                />
              </div>
            </section>

            <CaseImage
              src="/projects/dsa/brand-guidelines.png"
              alt="DSA brand guidelines covering logo, iconography, type, and colour"
              className="case-study-media--guidelines"
              sizes="100vw"
            />
          </div>

        <section className="case-study-system">
          <div className="case-study-brand-intro">
            <p className="case-study-label">Brand System</p>
            <h2 className="case-study-h2">
              I wanted the brand to work as a supportive internal design system
              that offers both nostalgic playfulness and systemic support:
            </h2>
          </div>

          <div className="case-study-principles">
            <div className="case-study-principle case-study-principle--play">
              <div className="case-study-principle-copy case-study-copy case-study-copy--muted">
                <p>Nostalgic Playfulness</p>
                <ul>
                  <li>
                    Disarms imposter syndrome: Evokes the uninhibited freedom of
                    childhood art-making to make design feel accessible again.
                  </li>
                  <li>
                    An open invitation to play: Creates a judgment-free
                    foundation where beginners and seniors alike can experiment
                    freely.
                  </li>
                </ul>
              </div>
              <CaseImage
                src="/projects/dsa/icons.png"
                alt="DSA student flower icon on a blue field"
                className="case-study-media--icons"
                sizes="(max-width: 1024px) 100vw, 746px"
              />
            </div>

            <div className="case-study-principle case-study-principle--flip">
              <div className="case-study-systematic-media">
                <Image
                  src="/projects/dsa/systematic-use.png"
                  alt="DSA Instagram post for a process documentation workshop"
                  fill
                  sizes="(max-width: 1024px) 100vw, 743px"
                />
              </div>
              <div className="case-study-principle-copy case-study-copy case-study-copy--muted">
                <p>Systematic Use</p>
                <p>
                  Reusable tokens and modular kits turn layout creation into a
                  fast drag-and-drop workflow. Cutting doen time taken to create
                  posts by 80%.
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>

        <section className="case-study-reflections">
          <div className="case-study-reflections-media">
            <CaseImage
              src="/projects/dsa/id-cards.png"
              alt="Front and back of a DSA event badge"
              className="case-study-media--id"
              crop="id"
              sizes="(max-width: 1024px) 100vw, 745px"
            />
            <div className="case-study-media case-study-media--tote">
              <div className="case-study-tote-a">
                <Image
                  src="/projects/dsa/tote-bag-1.png"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 836px"
                  className="object-cover"
                />
              </div>
              <div className="case-study-tote-b">
                <Image
                  src="/projects/dsa/tote-bag-2.png"
                  alt="Red DSA tote bag with a cream flower"
                  fill
                  sizes="(max-width: 1024px) 100vw, 786px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="case-study-reflections-copy">
            <p className="case-study-label">Reflections</p>
            <h2 className="case-study-h2">
              This was such a fun and different project for me.
            </h2>
            <p className="case-study-copy case-study-copy--muted">
              I’ve been apart of the DSA since my first-year and to accidentally
              have the chance to define our first-impression to people was an
              honour. I’m so happy with how this brand came out I was worried we
              would get stuck in a very rigid corporate brand going forward and
              I’m happy to be able to show that we’re still learning
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
