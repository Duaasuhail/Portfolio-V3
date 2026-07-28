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
      <div className="absolute inset-0 bg-[#090909]">
        <div className="absolute left-[54.5%] top-[16.5%] aspect-square w-[41.4%] -translate-x-[10%]">
          <Image
            src="/projects/ctrlvox-x.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 40vw, 280px"
            className="object-cover"
            priority
          />
        </div>
        <p className="font-poppins absolute left-[4.15%] top-[8.9%] w-[64%] text-[clamp(26px,6.6vw,44.5px)] font-medium tracking-[1.33px] text-[#a6d9c6]">
          CTRLVOX
        </p>
        <div className="font-poppins absolute left-[4.15%] top-[22.8%] w-[64%] text-[clamp(26px,6.6vw,44.5px)] font-medium tracking-[0.45px] text-white">
          <p className="leading-[0.64]">ON-DEVICE</p>
          <p className="leading-[0.64]">VOICE & CHAT</p>
          <p className="leading-[0.64]">MODERATION</p>
        </div>
        <div className="absolute bottom-[8.2%] left-[4.15%] h-[6%] w-[29.6%]">
          <Image
            src="/projects/ctrlvox-logo.png"
            alt="databiomes"
            fill
            sizes="200px"
            className="object-contain object-left"
          />
        </div>
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
      <div className="absolute inset-0 flex items-center justify-center bg-[#1050c0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/projects/dsa-logo.svg"
          alt="dsa"
          width={254}
          height={138}
          className="h-auto w-[37.7%] max-w-[254px]"
        />
      </div>
    </ProjectCard>
  );
}
