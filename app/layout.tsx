import type { Metadata } from "next";
import { Alegreya, Source_Sans_3, Poppins } from "next/font/google";
import "./globals.css";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

// Source Sans 3 is Google’s current Source Sans Pro family
const sourceSans = Source_Sans_3({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

const poppins = Poppins({
  weight: ["500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Duaa Suhail",
  description: "Designing for creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${alegreya.variable} ${sourceSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
