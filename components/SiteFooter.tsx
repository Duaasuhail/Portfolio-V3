import GalaxyBackground from "./GalaxyBackground";
import SkyShape from "./SkyShape";

const contactLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Email", href: "mailto:hello@duaasuhail.com" },
  { label: "Resume", href: "https://drive.google.com/file/d/1N0bpc18Pklr1DasmNaNBsTg3oyN3-Ix4/view?usp=sharing" },
] as const;

const pageLinks = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Philosophy (Coming Soon)", href: "#work" },
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
        <p className="site-footer-headline">Let’s make big things happen</p>

        <div className="site-footer-main">
          <ul className="site-footer-links site-footer-col site-footer-col--left">
            {contactLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <ul className="site-footer-links site-footer-col site-footer-col--right">
            {pageLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
