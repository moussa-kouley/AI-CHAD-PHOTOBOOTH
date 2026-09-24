import type { Metadata } from "next";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { copy } from "@/lib/kiosk-copy";
import { readEventSession } from "@/lib/event-guest";

type Props = { params: Promise<{ token: string }> };

function abs(path: string) {
  return `${env.APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  let title = copy.entering.fr;
  let image: string | undefined;

  const local = await readEventSession(token);
  if (local) {
    const photo = local.generations.find((item) => item.kind === "photo" && (item.brandedPath || item.outputPath));
    const still = photo?.brandedPath || photo?.outputPath;
    image = still ? abs(`/api/media/${still}`) : undefined;
    title = photo?.promptTitle || title;
  }

  const description = copy.defaultSubtitle.fr;
  const url = abs(`/s/${token}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      locale: "fr_TD",
      type: "website",
      siteName: BRAND.fr,
      url,
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
