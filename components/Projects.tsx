import { CtrlvoxCard, DsaCard } from "./ProjectCard";

export default function Projects() {
  return (
    <div
      className="page-shell grid grid-cols-1 lg:grid-cols-2"
      style={{ gap: "var(--projects-gap)" }}
    >
      <CtrlvoxCard />
      <DsaCard />
    </div>
  );
}
