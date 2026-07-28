import type { Metadata } from "next";
import { Alegreya, Alegreya_Sans, Poppins } from "next/font/google";
import "./globals.css";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya",
});

const alegreyaSans = Alegreya_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alegreya-sans",
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
      className={`${alegreya.variable} ${alegreyaSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
