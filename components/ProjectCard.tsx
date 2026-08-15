import Image from "next/image";
import type { ReactNode } from "react";

type ProjectCardProps = {
  title: string;
  tags: string;
  description: string;
  children: ReactNode;
};

export default function ProjectCard({
  title,
  tags,
  description,
  children,
}: ProjectCardProps) {
  return (
    <article className="flex w-full flex-col gap-3">
      <div className="relative aspect-[674/416] w-full overflow-hidden">
        {children}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-project-title text-black">{title}</h3>
          <p className="text-body shrink-0 text-muted">{tags}</p>
        </div>
        <p className="text-body text-muted">{description}</p>
      </div>
    </article>
  );
}

export function CtrlvoxCard() {
  return (
    <ProjectCard
      title="Ctrlvox - by Databiomes"
      tags="Product Design | B2B | Internship | Shipped"
      description="Creating a digital presence for an invisible product."
    >
      <div className="project-media project-media--ctrlvox absolute inset-0">
        <Image
          src="/projects/ctrlvox-cover.png"
          alt="Ctrlvox by Databiomes — on-device voice and chat moderation"
          fill
          sizes="(max-width: 1024px) 100vw, 674px"
          className="object-cover"
          priority
        />
      </div>
    </ProjectCard>
  );
}

export function DsaCard() {
  return (
    <ProjectCard
      title="DSA 2026-2027 Branding"
      tags="Brand Strategy | System Thinking | Shipped"
      description="Creating a digital presence for an invisible product."
    >
      <div className="project-media project-media--dsa absolute inset-0">
        <Image
          src="/projects/dsa-cover.png"
          alt="dsa"
          fill
          sizes="(max-width: 1024px) 100vw, 674px"
          className="object-cover"
        />
      </div>
    </ProjectCard>
  );
}
