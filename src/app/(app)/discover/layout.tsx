import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover Stories",
  description:
    "Discover trending stories, fresh content, and personalized recommendations. Explore a world of collaborative storytelling on Axelot.",
  openGraph: {
    title: "Discover Stories | Axelot",
    description:
      "Discover trending stories, fresh content, and personalized recommendations on Axelot.",
    type: "website",
  },
}

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
