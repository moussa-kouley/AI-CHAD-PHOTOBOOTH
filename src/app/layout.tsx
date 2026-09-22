import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { RegisterServiceWorker } from "@/components/register-sw";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const preferredRegion = ["dub1", "lhr1", "cdg1"];
export const runtime = "nodejs";

const display = localFont({
  src: "./fonts/instrument-serif-latin-400-normal.woff2",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
});

const sans = localFont({
  src: "./fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Avenir Next", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
});

function siteUrl() {
  try {
    return new URL(process.env.APP_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: BRAND.short,
  description: BRAND.description,
  applicationName: BRAND.fr,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: BRAND.crest, type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-64.png", type: "image/png", sizes: "64x64" },
    ],
    apple: [{ url: BRAND.crestRaster, sizes: "180x180" }],
  },
  openGraph: {
    title: BRAND.fr,
    description: BRAND.description,
    locale: "fr_TD",
    type: "website",
    siteName: BRAND.fr,
    images: [{ url: BRAND.crestRaster, width: 512, height: 512, alt: BRAND.fr }],
  },
  twitter: {
    card: "summary",
    title: BRAND.fr,
    description: BRAND.description,
    images: [BRAND.crestRaster],
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: BRAND.short },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const STRIP_PREVIEW_ATTRS = `(function(){
  function wipe(node){
    if (!node || !node.removeAttribute) return;
    if (node.hasAttribute && node.hasAttribute("data-cursor-ref")) node.removeAttribute("data-cursor-ref");
  }
  function scan(){
    var nodes = document.querySelectorAll("[data-cursor-ref]");
    for (var i = 0; i < nodes.length; i++) wipe(nodes[i]);
  }
  scan();
  var obs = new MutationObserver(function(muts){
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === "attributes") wipe(m.target);
      else if (m.addedNodes) {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          wipe(n);
          if (n && n.querySelectorAll) {
            var inner = n.querySelectorAll("[data-cursor-ref]");
            for (var k = 0; k < inner.length; k++) wipe(inner[k]);
          }
        }
      }
    }
  });
  obs.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:["data-cursor-ref"]});
  function stop(){ try { obs.disconnect(); } catch (e) {} }
  window.addEventListener("load", function(){ setTimeout(stop, 2000); });
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} antialiased`} suppressHydrationWarning>
        <Script id="strip-preview-attrs" strategy="beforeInteractive">
          {STRIP_PREVIEW_ATTRS}
        </Script>
        <div className="app-backdrop" aria-hidden="true">
          <img src="/assets/africa-future-backdrop.webp" alt="" decoding="async" />
        </div>
        <RegisterServiceWorker />
        <div className="app-stage">{children}</div>
      </body>
    </html>
  );
}
