import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overwatch",
};

export default function OverwatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

