import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "House AI",
  description: "Turn architectural inspiration into a floor plan and walkable 3D concept.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
