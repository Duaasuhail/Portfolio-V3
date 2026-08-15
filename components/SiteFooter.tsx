import GalaxyBackground from "./GalaxyBackground";
import SkyShape from "./SkyShape";

const contactLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Email", href: "mailto:hello@duaasuhail.com" },
  { label: "Resume", href: "/resume.pdf" },
] as const;

const pageLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Gaming", href: "#gaming" },
  { label: "Archive", href: "#archive" },
] as const;

/**
 * Site footer — same hero sky stack (SkyShape + bitmap galaxy), inverted
 * so cream rises into projects and deep space holds the Figma 544:50 layout.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <SkyShape variant="footer" />
      <GalaxyBackground variant="footer" />

      <div className="site-footer-content page-shell">
        <div className="site-footer-main">
          <div className="site-footer-col site-footer-col--left">
            <p className="site-footer-headline">Let’s make big things happen</p>
            <ul className="site-footer-links">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <ul className="site-footer-links site-footer-col site-footer-col--right">
            {pageLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer-credits">
          <p>Inspired by the 100s of hours on Mario Galaxy 1 &amp; 2</p>
          <p>Built with Next.js and a couple of Ice Capps</p>
          <p>Duaa Suhail 2026</p>
        </div>
      </div>
    </footer>
  );
}
