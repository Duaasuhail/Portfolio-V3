import type { CSSProperties } from "react";

type InterestPhoto = {
  src: string;
  alt: string;
  crop: CSSProperties;
};

const photos: InterestPhoto[] = [
  {
    src: "/about/interest-01.jpg",
    alt: "A musician singing into a microphone and playing guitar under red stage lights",
    crop: { height: "135.25%", left: "0", top: "-25.82%", width: "100%" },
  },
  {
    src: "/about/interest-02.jpg",
    alt: "A performer in a white dress standing among pink flowers on stage",
    crop: { height: "135.57%", left: "-0.06%", top: "-29.54%", width: "100.12%" },
  },
  {
    src: "/about/interest-03.jpg",
    alt: "A guitarist performing in blue stage haze, photographed from the crowd",
    crop: { height: "135.41%", left: "0", top: "-16.1%", width: "100%" },
  },
  {
    src: "/about/interest-04.jpg",
    alt: "A desk with a candle, figures, and a monitor showing a Marvel Rivals skin shop",
    crop: { height: "160.66%", left: "0", top: "-55.04%", width: "100%" },
  },
  {
    src: "/about/interest-05.jpg",
    alt: "A monitor showing a League of Legends champion select screen",
    crop: { height: "182.22%", left: "-16.68%", top: "-28.83%", width: "134.86%" },
  },
  {
    src: "/about/interest-06.jpg",
    alt: "A Splatoon match results screen on a monitor",
    crop: { height: "135.25%", left: "0", top: "-1.75%", width: "100%" },
  },
  {
    src: "/about/interest-07.jpg",
    alt: "A hand with long black marbled press-on nails",
    crop: { height: "135.17%", left: "0", top: "-35.16%", width: "100%" },
  },
  {
    src: "/about/interest-08.jpg",
    alt: "A person in a red shirt holding up hands covered in rings and decorated nails",
    crop: { height: "236.62%", left: "-60.12%", top: "-42.4%", width: "233.05%" },
  },
  {
    src: "/about/interest-09.jpg",
    alt: "A hand with pink and black patterned press-on nails",
    crop: { height: "188.5%", left: "-0.06%", top: "-45.11%", width: "139.21%" },
  },
];

function PhotoSet({
  hidden,
}: {
  hidden?: boolean;
}) {
  return (
    <div className="about-carousel-set" aria-hidden={hidden || undefined}>
      {photos.map((photo, index) => (
        <div className="about-photo" key={`${photo.src}-${hidden ? "loop" : "main"}`}>
          <img
            src={photo.src}
            alt={hidden ? "" : photo.alt}
            style={photo.crop}
            loading={hidden || index > 4 ? "lazy" : "eager"}
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

export default function InterestsCarousel() {
  return (
    <div
      className="about-carousel"
      aria-roledescription="carousel"
      aria-label="Photos of interests outside of design"
    >
      <div className="about-carousel-track">
        <PhotoSet />
        <PhotoSet hidden />
      </div>
    </div>
  );
}
