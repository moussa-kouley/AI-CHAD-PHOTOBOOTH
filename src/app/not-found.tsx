import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Pair } from "@/lib/kiosk-copy";
import { studio } from "@/lib/studio-copy";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-end px-6 pb-16">
      <BrandMark href="/" />
      <p className="eyebrow mt-10">{studio.lost.eyebrow}</p>
      <h1 className="mt-5 text-6xl">{studio.lost.title}</h1>
      <p className="pair-fr mt-3">{studio.lost.en}</p>
      <Link className="btn btn-gold mt-10" href="/">
        <Pair en={studio.lost.homeEn} fr={studio.lost.home} />
      </Link>
    </main>
  );
}
