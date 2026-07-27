import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhraman Retreats | Heal Through the Five Elements",
  description: "Elemental retreats rooted in nature, movement and stillness.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
