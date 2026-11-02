import { CtrlvoxCard, DsaCard, FeltCard } from "./ProjectCard";

export default function Projects() {
  return (
    <div className="page-shell">
      <h2 className="text-project-title text-greyscale-950 mb-6">
        Selected Projects
      </h2>
      <div className="projects-grid">
        <FeltCard />
        <DsaCard />
        <CtrlvoxCard />
      </div>
    </div>
  );
}
