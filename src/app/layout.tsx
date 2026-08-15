import type { Metadata } from "next";
import { Mulish, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { AskFab } from "@/components/ask-fab";
import { Footer } from "@/components/footer";
import { FooterGate } from "@/components/footer-gate";
import { Nav } from "@/components/nav";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Startup State",
    template: "%s · Startup State",
  },
  description:
    "GOED Government Opportunity Finder. Tell us about your company. See federal and Utah programs that fit, with a why.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} ${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
        <FooterGate>
          <Footer />
        </FooterGate>
        <AskFab />
      </body>
    </html>
  );
}
