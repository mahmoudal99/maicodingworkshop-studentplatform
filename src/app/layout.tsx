import type { Metadata } from "next";
import { Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/store";
import ParticleCanvas from "@/components/ParticleCanvas";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Think Like a Programmer -- 6-Week Coding Course",
  description:
    "A welcoming guide to six weeks of building, experimenting, and learning to code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${dmSans.variable}`}>
      <body>
        <UserProvider>
          <ParticleCanvas />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
