import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoTa Warehouse | Inventory and Picking",
  description: "Find inventory, plan shelf replenishment, and build an aisle-ordered pick list.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
