import Link from "next/link";

export type SiteNavLink = {
  label: string;
  href: string;
};

export default function SiteNav({
  links,
  nameHref = "/",
  currentHref,
}: {
  links: readonly SiteNavLink[];
  nameHref?: string | null;
  currentHref?: string;
}) {
  return (
    <header className="site-nav page-shell">
      {nameHref ? (
        <Link href={nameHref} className="site-nav-link text-nav whitespace-nowrap">
          Duaa Suhail
        </Link>
      ) : (
        <span className="site-nav-link text-nav whitespace-nowrap">Duaa Suhail</span>
      )}
      <nav className="flex items-center gap-12">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="site-nav-link text-nav whitespace-nowrap"
            aria-current={link.href === currentHref ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
