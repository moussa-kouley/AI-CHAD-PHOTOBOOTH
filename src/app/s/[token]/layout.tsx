import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { copy } from "@/lib/kiosk-copy";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const session = await prisma.session.findUnique({
    where: { shareToken: token },
    include: { generations: true },
  });
  const photo = session?.generations.find((item) => item.kind === "photo" && (item.brandedPath || item.outputPath));
  const still = photo?.brandedPath || photo?.outputPath;
  const image = still ? `${env.APP_URL.replace(/\/$/, "")}/api/media/${still}` : undefined;
  const title = photo?.promptTitle || copy.entering.fr;
  const description = copy.defaultSubtitle.fr;
  return {
    title,
    description,
    alternates: { canonical: `${env.APP_URL.replace(/\/$/, "")}/s/${token}` },
    openGraph: {
      title,
      description,
      locale: "fr_TD",
      type: "website",
      siteName: BRAND.fr,
      url: `${env.APP_URL.replace(/\/$/, "")}/s/${token}`,
      images: image ? [{ url: image, width: 1080, height: 1350, type: "image/jpeg", alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: title.slice(0, 12) },
  };
}

export default function SouvenirLayout({ children }: { children: React.ReactNode }) {
  return children;
}
