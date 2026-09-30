import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Daily-Do",
  description: "Your One Thing, Top 3, meetings, notes, and yesterday's ideas.",
  appleWebApp: { capable: true, title: "Daily-Do", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#15161d",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
