import type { Metadata } from "next";
import { Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/store";
import { ProgressProvider } from "@/lib/progress";
import { AdminUnlockProvider } from "@/lib/admin-unlock";
import ParticleCanvas from "@/components/ParticleCanvas";

const siteUrl = (() => {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    "https://maicodingworkshop.netlify.app";

  return value.startsWith("http") ? value : `https://${value}`;
})();

const siteDescription =
  "Interactive spaceship-themed coding workshop for ages 8–14. Learn binary, sequencing, memory, and real code through playable missions.";

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Think Like a Programmer | Interactive Kids Coding Workshop",
    template: "%s | Think Like a Programmer",
  },
  description: siteDescription,
  applicationName: "Think Like a Programmer",
  keywords: [
    "kids coding",
    "coding workshop",
    "binary for kids",
    "programming for children",
    "interactive coding game",
    "spaceship coding",
    "coding course ages 8-14",
  ],
  openGraph: {
    type: "website",
    siteName: "Think Like a Programmer",
    title: "Think Like a Programmer",
    description: siteDescription,
    locale: "en_IE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Think Like a Programmer",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <ProgressProvider>
            <AdminUnlockProvider>
              <ParticleCanvas />
              {children}
            </AdminUnlockProvider>
          </ProgressProvider>
        </UserProvider>
      </body>
    </html>
  );
}
