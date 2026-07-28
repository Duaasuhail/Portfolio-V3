import GalaxyBackground from "./GalaxyBackground";
import SkyShape from "./SkyShape";

const navLinks = ["Work", "Gaming", "About"];

// Sky gradient taller than one screen — organic fade further down
export const HERO_VH = 175;

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-x-clip text-white"
      style={{
        height: `${HERO_VH}vh`,
        backgroundColor: "var(--surface)",
      }}
    >
      <SkyShape />
      <GalaxyBackground />

      <div className="relative z-10 flex h-screen w-full flex-col">
        <header
          className="page-shell flex items-center justify-between"
          style={{ paddingTop: "var(--nav-top)" }}
        >
          <span className="text-nav whitespace-nowrap">Duaa Suhail</span>
          <nav className="flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-nav whitespace-nowrap transition-opacity hover:opacity-70"
              >
                {link}
              </a>
            ))}
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-[var(--page-gutter)] text-center">
          <h1 className="text-h1 whitespace-nowrap">
            Tiniest details make the biggest difference
          </h1>
          <div className="text-h3 mt-5">
            <p>Duaa Suhail</p>
            <p>designing for creators</p>
          </div>
        </main>

        <footer
          className="page-shell flex items-end justify-between"
          style={{ paddingBottom: "var(--hero-footer-bottom)" }}
        >
          <div className="text-body max-w-[315px]">
            <p>The more stars the more beautiful the sky becomes</p>
            <p>Click to add more stars</p>
          </div>
          <p className="text-body max-w-[248px] text-right">
            Learn more about my design philosophy
          </p>
        </footer>
      </div>
    </section>
  );
}
