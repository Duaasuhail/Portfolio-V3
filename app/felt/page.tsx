import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FeltSurveyResponses from "@/components/FeltSurveyResponses";

export const metadata: Metadata = {
  title: "felt. — Duaa Suhail",
  description:
    "Turning invisible, subjective menstrual pain into objective, undeniable data to close communication gaps in healthcare.",
};

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
] as const;

type QuoteShot = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cover?: boolean;
  img?: CSSProperties;
};

const quotes: QuoteShot[] = [
  { src: "quote-1.png", x: 1238.79, y: 254.37, w: 257.574, h: 75.892, img: { width: "463.39%" } },
  { src: "quote-14.png", x: 3.09, y: 50.73, w: 1192.812, h: 105.023, cover: true },
  { src: "quote-18.png", x: 590.08, y: 832.11, w: 777.321, h: 83.558, img: { width: "153.85%" } },
  { src: "quote-17.png", x: 20.83, y: 811.28, w: 579.541, h: 78.959, img: { width: "206.22%" } },
  { src: "quote-7.png", x: 0, y: 262.85, w: 1154.482, h: 114.222, img: { width: "103.65%" } },
  { src: "quote-6.png", x: 0, y: 582.19, w: 1195.878, h: 112.689, cover: true },
  { src: "quote-5.png", x: 7.71, y: 151.28, w: 788.053, h: 74.359, img: { width: "152.04%" } },
  { src: "quote-13.png", x: 729.84, y: 718.71, w: 758.156, h: 80.492, img: { width: "157.74%" } },
  { src: "quote-2.png", x: 874.71, y: 119.38, w: 626.303, h: 72.826, img: { width: "190.33%" } },
  { src: "quote-19.png", x: 259.92, y: 220.27, w: 541.211, h: 68.993, cover: true },
  { src: "quote-4.png", x: 861.6, y: 188.8, w: 397.093, h: 73.592, img: { width: "300.77%" } },
  { src: "quote-12.png", x: 408.82, y: 653.16, w: 1103.121, h: 78.192, img: { width: "108.34%" } },
  { src: "quote-15.png", x: 1073.72, y: 782.74, w: 413.958, h: 78.959, img: { width: "288.33%" } },
  {
    src: "quote-21.png",
    x: 85.62,
    y: 767.32,
    w: 870.845,
    h: 57.494,
    img: { width: "125.44%", left: "-0.04%", top: "0.67%" },
  },
  { src: "quote-11.png", x: 7.71, y: 708.14, w: 614.768, h: 72.368, img: { width: "181.47%" } },
  { src: "quote-3.png", x: 67.88, y: 353.1, w: 806.451, h: 81.258, img: { width: "147.81%" } },
  { src: "quote-22.png", x: 543.03, y: 319.16, w: 968.968, h: 59.027, cover: true },
  { src: "quote-10.png", x: 0, y: 485.77, w: 1194.345, h: 111.922, cover: true },
  { src: "quote-9.png", x: 1083.75, y: 536.68, w: 427.756, h: 78.192, img: { width: "279.21%" } },
  { src: "quote-23.png", x: 336.31, y: 415.58, w: 1175.541, h: 87.934, cover: true },
];

const stats = [
  {
    value: "75.9%",
    text: "of menstruators report pushing through debilitating symptoms daily just to keep up with work, school, and routine life.",
  },
  {
    value: "73.1%",
    text: "feel their menstrual pain is routinely trivialized or not taken seriously.",
  },
  {
    value: "54.5%",
    text: "of individuals who actively sought clinical healthcare had their pain outright dismissed by medical professionals.",
  },
] as const;

const solutionCards = [
  {
    title: "The Felt. Patch",
    body: "A discreet, flexible adhesive patch worn on the lower abdomen that tracks uterine muscle contractions (EMG), dermal temperature shifts, and physiological stress signals in real time.",
  },
  {
    title: "Connection to the Apple Ecosystem",
    body: "When an acute pain flare-up strikes in the middle of a class, meeting, or commute, pulling out a phone to open an app and complete a questionnaire is disruptive and socially uncomfortable.",
  },
  {
    title: "Empowering + Bold",
    body: "Syncs with the patch via Bluetooth to translate raw physiological signals into an objective pain score, human metaphors, 3D anatomical maps, and exportable medical reports.",
  },
] as const;

const solutionShots = [
  {
    src: "/projects/felt/patch.png",
    alt: "A discreet sensor patch worn on the lower abdomen",
    img: { width: "119.74%", height: "104.78%", left: "-9.78%", top: "0.07%" },
  },
  {
    src: "/projects/felt/watch.png",
    alt: "Apple Watch showing a Felt. pain widget",
    img: { width: "184.91%", height: "100.09%", left: "-55.15%", top: "-0.11%" },
  },
  {
    src: "/projects/felt/widget-phone.png",
    alt: "iPhone showing a Felt. lock screen widget",
    img: { width: "334.55%", height: "185.96%", left: "-73.48%", top: "-45.85%" },
  },
] as const;

const processShots = [
  {
    src: "/projects/felt/process-95.png",
    alt: "Early research notes about period pain, sensing, and the product idea",
    ratio: "710 / 453",
    img: { width: "102.18%", height: "111.7%", left: "-2.11%", top: "-6.18%" },
  },
  {
    src: "/projects/felt/process-94.png",
    alt: "Mobile UI references explored alongside Figma Make",
    ratio: "673 / 434",
    img: { width: "105.43%", height: "99.86%", left: "-2.04%", top: "0.17%" },
  },
  {
    src: "/projects/felt/process-96.png",
    alt: "High-fidelity Felt. screens laid out in Figma Design",
    ratio: "674 / 452",
    img: { width: "104.15%", height: "114.73%", left: "0", top: "-9.78%" },
  },
  {
    src: "/projects/felt/process-90.png",
    alt: "Felt. homepage explorations with the pain score and metaphor card",
    ratio: "675 / 453",
    img: { width: "120.08%", height: "100.09%", left: "-20.08%", top: "0" },
  },
] as const;

const iterations = [
  {
    name: "Iteration 1 (Homepage PRD)",
    objective: "Single-screen mobile homepage",
    changes:
      "Defined two-row mobile header, Gloock + Halenoir type scale, 30-second Pain Score transitions, and +1 point metaphor updates.",
  },
  {
    name: "Iteration 2 (Pain History PRD)",
    objective: "Build a single-screen ‘Pain History’ page",
    changes:
      "Referenced our Homepage Figma file for strict style parity; structured daily, monthly, and yearly data highlight sections.",
  },
  {
    name: "Iteration 3 (Ecosystem Linking)",
    objective:
      "Prototype the provided Figma files screens together for a mobile app based on the PRD below.",
    changes:
      "Embedded explicit hex styles (Primary, Secondary, Grayscale, Pain Scale 1–10), typography CSS code, and dynamic 6.0 → 4.0 / 5.0 / 7.0 card updates (homepage updates).",
  },
  {
    name: "Iteration 4 (Onboarding Flow)",
    objective: "6-page linear onboarding + Empty State",
    changes:
      "Specified strict linear progression, back-button history, and a 3-second auto-fade from the Empty State Homepage to the Default Homepage.",
  },
  {
    name: "Iteration 5 (Defensive Polish)",
    objective: "Final interaction lock & guardrails",
    changes:
      'Added strict negative constraints ("Do not create new pages", "Do not use drop shadows", "1px borders with 16px min padding"), and capped calendar dates (Feb 2 start date, Jan 2025–June 2026 range) to prevent infinite data generation.',
  },
] as const;

const features: {
  title: string;
  mediaFirst: boolean;
  media: { src: string; alt: string; narrow?: boolean; img?: CSSProperties };
  groups: { title: string; items: string[] }[];
}[] = [
  {
    title: "Onboarding",
    mediaFirst: true,
    media: {
      src: "/projects/felt/onboarding.gif",
      alt: "Felt. sign-in screen on a phone, reading “Giving period pain a visual language.”",
      narrow: true,
    },
    groups: [
      {
        title: "Pain Type Selection",
        items: ["Choose from different pain disorders and conditions."],
      },
      {
        title: "Pain Intensity Scale",
        items: ["Colour coded so it feels human and not clinical."],
      },
      {
        title: "Frequency Tracking",
        items: ["Personalizes logging around your daily routine."],
      },
      {
        title: "Notification Preferences",
        items: ["Check-ins, medication reminders, all in your control."],
      },
    ],
  },
  {
    title: "Pain History",
    mediaFirst: false,
    media: {
      src: "/projects/felt/history-phone.gif",
      alt: "Felt. splash screen on a phone: “Felt. Pain. Understood.”",
    },
    groups: [
      {
        title: "Monthly Pain Calendar",
        items: ["See your entire month of pain at once."],
      },
      {
        title: "Weekly Summary",
        items: ["Spot patterns before they catch you off guard."],
      },
      {
        title: "Pain Dimensions",
        items: ["Because pain affects more than just your body."],
      },
      {
        title: "Community Match",
        items: ["“17,113 others feel the exact same pain today.”"],
      },
    ],
  },
  {
    title: "Self Diagnosis",
    mediaFirst: true,
    media: {
      src: "/projects/felt/feature-99.gif",
      alt: "Felt. splash screen on a textured blue background",
      img: { width: "102.91%", height: "100.02%", left: "-1.52%", top: "-0.23%" },
    },
    groups: [
      {
        title: "3D Visualizer",
        items: ["Tap and mark exactly what’s in pain."],
      },
      {
        title: "Emotional State Tracker",
        items: ["Rate the emotional state you’re feeling."],
      },
      {
        title: "Free Notes Field",
        items: ["Add any additional context about the day."],
      },
      {
        title: "Data Privacy",
        items: ["Anonymized and never shared without consent."],
      },
    ],
  },
  {
    title: "Automatic Emergency Notifications",
    mediaFirst: false,
    media: {
      src: "/projects/felt/notification.gif",
      alt: "Phone lock screen used in the Felt. emergency notification prototype",
    },
    groups: [
      {
        title: "Severity Thresholds",
        items: ["Define the intensity level required to auto-notify contacts."],
      },
      {
        title: "Pre-Configured SMS",
        items: ["Texts your emergency contact immediately without manual typing."],
      },
      {
        title: "Real-Time Status & Location",
        items: ["Shares your current pain score and GPS coordinates."],
      },
      {
        title: "Smart Safeguards",
        items: ["Dismiss false alarms with a simple tap before dispatch."],
      },
    ],
  },
];

const prototypeUrl =
  "https://www.figma.com/make/BEjb9cpbzcfKBQ1OtDE8fg/Final-Mockup---Felt.?t=nVqHYQVI4RjDiYZ1-20&fullscreen=1";

function FramedImage({
  src,
  alt,
  ratio,
  img,
  className,
}: {
  src: string;
  alt: string;
  ratio?: string;
  img?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={`felt-frame ${className ?? ""}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img src={src} alt={alt} className={img ? undefined : "is-cover"} style={img} />
    </div>
  );
}

function FeatureCopy({
  title,
  groups,
}: {
  title: string;
  groups: { title: string; items: string[] }[];
}) {
  return (
    <div className="felt-feature-copy">
      <p className="felt-feature-title">{title}</p>
      {groups.map((group) => (
        <div key={group.title} className="felt-feature-group">
          <p>{group.title}</p>
          <ul>
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function FeltPage() {
  return (
    <div className="case-study felt">
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

      <main className="felt-main">
        <section className="felt-hero">
          <div className="felt-hero-intro">
            <h1 className="case-study-h1">
              Turning invisible, subjective menstrual pain into objective,
              undeniable data to close communication gaps in healthcare.
            </h1>
            <div className="felt-kicker case-study-copy">
              <p>
                Winner - 2026 RGD Student Award for UX Design - Built for
                FigBuild 2026
              </p>
              <a
                className="felt-link"
                href="https://devpost.com/software/felt-o70ij6"
                target="_blank"
                rel="noreferrer"
              >
                View on Devpost
              </a>
            </div>
          </div>

          <div className="felt-hero-media">
            <img
              src="/projects/felt/hero.png"
              alt="Felt. home screen on a phone, showing a pain score of 6.0 and the metaphor “Someone left a dagger in your stomach and forgot about it.”"
            />
          </div>

          <div className="felt-summary">
            <p className="case-study-copy case-study-copy--ink">Felt. - Figbuild 2026</p>
            <div className="felt-meta">
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Role</h2>
                <p className="case-study-copy felt-meta-value--dim">
                  Product Designer, UX Researcher
                </p>
              </div>
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Tools</h2>
                <p className="case-study-copy case-study-copy--muted">
                  Figma Design, Figma Make, Google Gemini
                </p>
              </div>
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Team</h2>
                <p className="case-study-copy felt-meta-value--dim">
                  <a
                    className="felt-link"
                    href="https://richardlau.ca/home/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Richard Lau
                  </a>
                  {" & me!"}
                </p>
              </div>
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Disciplines</h2>
                <p className="case-study-copy case-study-copy--muted">
                  Figma, Quantitative &amp; Qualitative Surveying, System
                  Architecture, Mobile &amp; Wearable UX
                </p>
              </div>
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Timeline</h2>
                <p className="case-study-copy felt-meta-value--dim">72 hours</p>
              </div>
              <div className="felt-meta-item">
                <h2 className="case-study-h2 case-study-h2--meta">Recognition</h2>
                <p className="case-study-copy case-study-copy--muted">
                  <strong>Winner, </strong>
                  <a
                    className="felt-link"
                    href="https://rgd.ca/hiring-designers/award-winners/2026-student-awards-winners/award-for-ux-design"
                    target="_blank"
                    rel="noreferrer"
                  >
                    RGD Award for UX Design 2026
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="felt-block">
          <p className="case-study-label">The Challenge</p>
          <h2 className="case-study-h2">
            “Identify something intangible, invisible, or previously
            unmeasurable about the human sensory experience and design a
            speculative tool to track and influence it.&quot;
          </h2>
          <div className="felt-prose case-study-copy case-study-copy--muted">
            <p>
              Over 72 hours, Richard and I designed, prototyped, and tested
              Felt. a cross-device ecosystem that bridges the gap between lived
              sensory agony and clinical validation.
            </p>
            <div className="felt-blank" aria-hidden="true" />
            <p>
              While we didn’t walk away with a placement at FigBuild, our
              conviction in the problem carried the project forward: Felt. went
              on to win the 2026 RGD Student Award for UX Design, recognized
              nationally for its human-centered research, system architecture,
              and trauma-informed healthcare UX.
            </p>
          </div>
        </section>

        <div className="felt-cluster">
          <section className="felt-block">
            <p className="case-study-label">The Problem</p>
            <h2 className="case-study-h2">
              Pain is one of the oldest human sensations, yet we still can’t see
              it.
            </h2>
            <p className="case-study-copy case-study-copy--muted">
              <strong>Over 1.8 billion</strong> people menstruate worldwide
              roughly <strong>one</strong> in <strong>every</strong>{" "}
              <strong>five</strong> people on Earth. Yet menstrual pain remains
              trapped in a double bind: it is simultaneously normalized as an
              expected inconvenience and dismissed when patients seek medical
              intervention.
            </p>
          </section>

          <section className="felt-block felt-interoception">
            <div className="felt-split">
              <div className="felt-split-copy">
                <h2 className="case-study-h2">
                  With mensuration, comes the sensation of pain, more specifically{" "}
                  <strong>Interoception</strong>. It is your body&apos;s internal
                  sense of its own physical state.
                </h2>
                <p className="case-study-copy case-study-copy--muted">
                  Menstrual pain is systemic, multifaceted, and deeply somatic. It
                  manifests as migraines, brain fog, nausea, pelvic inflammation,
                  fainting spells, and debilitating muscle weakness. Yet the
                  standard clinical diagnostic tool remains the reductionist
                  1-to-10 numerical rating scale a tool that flattens complex
                  bodily trauma into an arbitrary digit that healthcare providers
                  often discount.
                </p>
              </div>
              <div className="felt-frame felt-body-diagram">
                <img
                  src="/projects/felt/Menstruation-symptoms.png"
                  alt="Body diagram mapping menstrual symptoms, including brain fog, nausea, abdominal cramping, and muscle weakness"
                  className="is-cover"
                />
              </div>
            </div>
          </section>

          <section className="felt-stats" aria-label="Survey findings">
            {stats.map((stat) => (
              <article key={stat.value} className="felt-stat">
                <p className="felt-stat-value">{stat.value}</p>
                <p className="case-study-copy case-study-copy--muted">{stat.text}</p>
              </article>
            ))}
            <p className="case-study-label">Source: our survey</p>
          </section>
        </div>

        <div className="felt-cluster">
          <section className="felt-block">
            <p className="case-study-label">Live Research</p>
            <h2 className="case-study-h2">
              Fifty-two responses, and fifty-two different ways to describe a
              collective pain, invisible to society.
            </h2>
            <p className="case-study-copy case-study-copy--muted">
              During our 72-hour sprint, medical articles weren&apos;t enough we
              wanted to hear from people living through this. We sent a live
              Google Form survey and asked 52 menstruators a single qualitative
              question:
            </p>
          </section>

          <p className="felt-pullquote">
            &quot;If you had to describe your worst cramps using a completely
            unrelated metaphor, what would it be?&quot;
          </p>

          <FeltSurveyResponses quotes={quotes} />

          <p className="felt-pullquote felt-pullquote--narrow">
            The responses were raw, and understandable. When people lack
            objective clinical proof, they have to reach for extreme language
            just to feel heard.
          </p>
        </div>

        <section className="felt-block">
          <p className="case-study-label">Problem Statement</p>
          <h2 className="case-study-h2">
            Period pain is often dismissed as “normal,” making it difficult for
            people to have their pain taken seriously.
          </h2>
          <p className="case-study-copy case-study-copy--muted">
            Without a way to track, visualize, or prove their pain, menstruators
            are left without the tools to advocate for themselves, in clinics,
            workplaces, and everyday life.
          </p>
        </section>

        <section className="felt-stack">
          <div className="felt-block">
            <p className="case-study-label">Solution</p>
            <h2 className="case-study-h2">
              Felt. is a speculative bio-telemetry patch and connected
              multi-surface ecosystem that translates subjective menstrual agony
              into objective, actionable diagnostic records.
            </h2>
            <p className="case-study-copy case-study-copy--muted">
              Rather than forcing users into repetitive manual journal logs
              while they are physically incapacitated, Felt. uses a two-part
              hybrid model: passive biometric sensing through a discreet dermal
              patch, paired with an empathy-driven companion interface on iOS
              and watchOS.
            </p>
          </div>

          <div className="felt-solutions">
            {solutionCards.map((card) => (
              <article key={card.title} className="felt-solution-card">
                <h3 className="felt-h3">{card.title}</h3>
                <p className="case-study-copy case-study-copy--muted">{card.body}</p>
              </article>
            ))}
          </div>

          <div className="felt-block">
            <div className="felt-solution-shots">
              {solutionShots.map((shot) => (
                <div key={shot.src} className="felt-solution-shot">
                  <FramedImage src={shot.src} alt={shot.alt} img={shot.img} />
                </div>
              ))}
            </div>
            <p className="felt-caption">*Generated by Google Gemini</p>
          </div>
        </section>

        <section className="felt-stack">
          <div className="felt-block">
            <p className="case-study-label">Process</p>
            <h2 className="case-study-h2">
              Phase 1: Real research to then testing out Figma Make
            </h2>
            <p className="case-study-copy case-study-copy--muted">
              With only 72 hours we decided to test out Figma Make at the start
              of our sprint as a divergent visual sandbox generating early UI
              directions and layout explorations alongside online mobile
              references to see what worked and what felt too clinical. Once we
              found a visual direction that resonated, we stepped into Figma
              Design to hand-craft 2 high-fidelity pages, establishing our
              Gloock and Halenoir typography hierarchy, custom card spacing, and
              1–10 colour system.
            </p>
          </div>

          <div className="felt-process-grid">
            {processShots.map((shot) => (
              <FramedImage
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                ratio={shot.ratio}
                img={shot.img}
              />
            ))}
          </div>

          <div className="felt-block">
            <h2 className="case-study-h2">
              Phase 2: Stress-Testing Figma Make with 5 Iterative PRDs
            </h2>
            <div className="felt-prose case-study-copy case-study-copy--muted">
              <p>
                Once our Homepage was built, we wanted to see how far we could
                push Figma Make to generate the remaining flows and wire our
                multi-screen interactions. Because one-line prompts stripped
                away our styling.
              </p>
              <div className="felt-blank" aria-hidden="true" />
              <p>
                So Richard and I wrote five iterative Product Requirements
                Document (PRD) scripts to feed the AI alongside our Homepage
                Figma file.
              </p>
            </div>

            <div className="felt-iterations-scroll">
            <div className="felt-iterations">
              <p className="felt-iterations-head">Prompt Iteration</p>
              <p className="felt-iterations-head">Objective</p>
              <p className="felt-iterations-head">Key Prompt Engineering Changes</p>
              {iterations.map((row) => (
                <div key={row.name} className="felt-iterations-row">
                  <p>{row.name}</p>
                  <p>{row.objective}</p>
                  <p>{row.changes}</p>
                </div>
              ))}
            </div>
            </div>
          </div>

          <div className="felt-block">
            <FramedImage
              src="/projects/felt/process-103.png"
              alt="Figma Make building the Felt. homepage from a product requirements prompt"
              ratio="1368 / 773"
              img={{ width: "100%", height: "102.61%", left: "0", top: "0.01%" }}
            />
          </div>

          <div className="felt-block">
            <h2 className="case-study-h2">
              Phase 3: Manual Prototyping?? (After all of that?!)
            </h2>
            <div className="felt-prose case-study-copy case-study-copy--muted">
              <p>
                After finishing our high-fidelity screens, we tried having Figma
                Make connect our buttons, build animations, and wire our
                multi-screen flows.
              </p>
              <div className="felt-blank" aria-hidden="true" />
              <p>
                Instead of compromising on quality, we manually built and
                prototyped the entire final experience in Figma Design. Using
                Figma Make early on for style inspiration and structural
                exploration still saved us hours of initial setup and we carried
                over the best interactive ideas it sparked (like the 3-second
                Empty State fade and live-updating metaphor cards) straight into
                our hand-crafted prototype.
              </p>
              <div className="felt-blank" aria-hidden="true" />
              <p>
                <strong>
                  We decided not to use the Figma Make prototype for our final
                  deliverable. Instead, we manually built, wired, and animated
                  the entire final prototype inside Figma Design.
                  <br />
                  You can still test it out here:{" "}
                  <a className="felt-link felt-url" href={prototypeUrl} target="_blank" rel="noreferrer">
                    {prototypeUrl}
                  </a>
                </strong>
              </p>
            </div>
          </div>
        </section>

        <section className="felt-stack">
          <div className="felt-block felt-features-intro">
            <p className="case-study-label">Features</p>
            <h2 className="case-study-h2">
              We wanted the visual language to work as a gentle ambient
              environment that offers both soothing comfort and diagnostic
              precision.
            </h2>
          </div>

          <div className="felt-features">
            {features.map((feature) => {
              const media = (
                <FramedImage
                  src={feature.media.src}
                  alt={feature.media.alt}
                  ratio={feature.media.narrow ? "656 / 563" : "674 / 563"}
                  img={feature.media.img}
                  className={feature.media.narrow ? "felt-feature-media--narrow" : undefined}
                />
              );
              const copy = <FeatureCopy title={feature.title} groups={feature.groups} />;
              return feature.mediaFirst ? (
                <div key={feature.title} className="felt-feature-pair">
                  {media}
                  {copy}
                </div>
              ) : (
                <div key={feature.title} className="felt-feature-pair">
                  {copy}
                  {media}
                </div>
              );
            })}
          </div>
        </section>

        <section className="felt-block">
          <p className="case-study-label">Reflections</p>
          <h2 className="case-study-h2">
            Experiment with different workflows you’ll never know what works.
          </h2>
          <p className="case-study-copy case-study-copy--muted">
            Experimenting with new tools and processes pushed us out of our
            comfort zone. While introducing a completely new design approach
            added friction and technical hurdles, it revealed alternative
            solutions we wouldn’t have arrived at otherwise.
          </p>
        </section>
      </main>
    </div>
  );
}
