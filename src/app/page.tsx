import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { HomeLiveStill } from "@/components/home-live-still";
import { attractCovers } from "@/lib/theme-look";

const covers = attractCovers();
const rails = [
  ["Internet", "Le Tchad rejoint le forum mondial. IGF. Fibre. Souveraineté du réseau."],
  ["IA", "L’intelligence artificielle au service du développement tchadien."],
  ["Cyber", "Protéger les données, les institutions, la jeunesse en ligne."],
  ["École", "Savoir à N’Djamena. Un visage réel dans un monde connecté."],
] as const;
const worlds = [
  ["IA", "Intelligence artificielle", "N’Djamena"],
  ["Cyber", "Cybersécurité", "Souveraineté"],
  ["École", "Éducation", "Jeunesse"],
  ["Réseau", "Internet · IGF", "Connexion"],
  ["Forum", "Gouvernance", "FGI Tchad"],
  ["Jeunesse", "Place de la Nation", "N’Djamena"],
  ["Sahel", "Territoire", "Fibre et soleil"],
  ["Tchad", "Nation", "10e édition"],
] as const;

function NetworkField() {
  return (
    <div className="home-mesh" aria-hidden="true">
      <p className="home-watermark">INTERNET</p>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fiber" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#7ec8ff" />
            <stop offset="1" stopColor="#FECB00" />
          </linearGradient>
          <radialGradient id="globe" cx="0.55" cy="0.45" r="0.55">
            <stop stopColor="#7ec8ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#7ec8ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="1180" cy="250" rx="320" ry="320" fill="url(#globe)" />
        <ellipse cx="1180" cy="250" rx="240" ry="240" fill="none" stroke="#7ec8ff" strokeOpacity="0.2" />
        <ellipse cx="1180" cy="250" rx="168" ry="168" fill="none" stroke="#7ec8ff" strokeOpacity="0.14" />
        <ellipse cx="1180" cy="250" rx="92" ry="92" fill="none" stroke="#FECB00" strokeOpacity="0.28" />
        <g className="home-rings" transform="translate(508 648)">
          <circle r="46" />
          <circle r="102" />
          <circle r="168" />
          <circle r="248" />
        </g>
        <path
          className="home-chad"
          d="M430 175 C490 155 545 168 560 230 C578 310 585 390 598 470 C612 545 640 600 655 655 C640 710 590 755 530 768 C475 755 445 710 438 650 C428 560 418 470 422 380 C426 290 412 220 430 175 Z"
        />
        <g className="home-fibers" fill="none" stroke="url(#fiber)" strokeWidth="1.35">
          <path d="M508 648 C 680 580, 920 360, 1180 250" />
          <path d="M508 648 C 740 720, 1020 480, 1260 310" />
          <path d="M508 648 C 620 420, 860 220, 1100 180" />
          <path d="M180 120 C 300 260, 400 480, 508 648" />
          <path d="M80 420 C 220 500, 360 600, 508 648" />
          <path d="M260 820 C 360 760, 430 700, 508 648" />
        </g>
        <g className="home-nodes">
          <circle cx="508" cy="648" r="6" />
          <circle cx="1180" cy="250" r="5" />
          <circle cx="180" cy="120" r="3.5" />
          <circle cx="80" cy="420" r="3" />
          <circle cx="260" cy="820" r="3" />
          <circle cx="740" cy="430" r="3.2" />
          <circle cx="920" cy="330" r="2.8" />
          <circle cx="1260" cy="310" r="3" />
          <circle cx="1100" cy="180" r="2.6" />
        </g>
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="home">
      <NetworkField />
      <span className="home-flag" />
      <header className="home-bar">
        <BrandMark href="/" />
        <div className="home-bar-end">
          <div className="home-partners home-partners-bar">
            <img src="/brand/fgi-tchad.png" alt="FGI Tchad" />
            <img src="/brand/igf.webp" alt="Internet Governance Forum" className="home-igf" />
          </div>
          <nav>
            <Link href="/login">Connexion</Link>
            <Link className="home-nav-go" href="/register">
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <section className="home-broadcast">
        <img
          src="/themes/fgi-cover.jpg"
          alt="FGI Tchad, 10e édition. L’intelligence artificielle au service du développement tchadien. 23–24 septembre 2026, N’Djamena."
        />
      </section>
      <p className="home-signal">
        <b>23–24 sept. 2026</b>
        <span>N’Djamena</span>
        <span>IGF</span>
        <span>Gouvernance de l’internet</span>
        <span>Fibre · Souveraineté · Réseau</span>
      </p>

      <section className="home-manifesto">
        <div className="home-copy">
          <p className="eyebrow">Forum sur la gouvernance de l’Internet · Tchad</p>
          <h1>
            Connecter le Tchad
            <span>
              à l’<em>internet</em>.
            </span>
          </h1>
          <p className="home-lead">
            Photobooth FGI. Votre visage reste. Le réseau change : IA, cyber, école, fibre. Un modèle pour chaque invitée, chaque invité.
          </p>
          <div className="home-cta">
            <Link className="btn btn-gold" href="/register">
              Entrer dans le réseau
            </Link>
            <Link className="btn btn-ghost" href="/login">
              J’ai un booth
            </Link>
          </div>
        </div>
        <HomeLiveStill />
      </section>

      <section className="home-block">
        <header className="home-head">
          <p className="eyebrow">Le forum</p>
          <h2>Quatre fils du réseau.</h2>
        </header>
        <ol className="home-rails">
          {rails.map(([title, line], railIndex) => (
            <li key={title}>
              <p className="eyebrow">0{railIndex + 1}</p>
              <h3>{title}</h3>
              <p>{line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-block">
        <header className="home-head">
          <p className="eyebrow">Mondes</p>
          <h2>Le visage réel. L’internet tchadien.</h2>
        </header>
        <ul className="home-shots">
          {worlds.map(([title, meaning, place]) => {
            const look = covers.find(([name]) => name === title)?.[1];
            return (
              <li key={title}>
                <div className="home-shot">{look?.cover ? <img src={look.cover} alt="" /> : null}</div>
                <p className="home-caption">
                  <b>{title}</b>
                  <span>{meaning}</span>
                  <small>{place}</small>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="home-end">
        <div className="home-partners">
          <img src="/brand/fgi-tchad.png" alt="FGI Tchad" />
          <img src="/brand/igf.webp" alt="Internet Governance Forum" className="home-igf" />
        </div>
        <h2>Ouvrir le booth FGI.</h2>
        <p>10e édition. L’intelligence artificielle au service du développement tchadien.</p>
        <div className="home-cta">
          <Link className="btn btn-gold" href="/register">
            Commencer
          </Link>
          <Link className="btn btn-ghost" href="/login">
            Connexion
          </Link>
        </div>
      </section>
    </main>
  );
}
