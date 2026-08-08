import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Orders",
  description: "Want something custom? We create and print custom posters and polaroids tailored just for you. Any design, any vibe.",
  openGraph: {
    title: "Custom Orders | Wall Crawl Nation",
    description: "Get your own custom posters and polaroid photos printed.",
    url: "https://wall-crawl-nation.vercel.app/custom-order",
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
