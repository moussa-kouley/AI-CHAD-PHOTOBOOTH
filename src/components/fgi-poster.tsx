import { FGI_POSTER_DATES, FGI_POSTER_SRC, fgiPosterDatesCss, fgiPosterHoleCss } from "@/lib/fgi-poster-box";

type Props = {
  photo: string;
  alt?: string;
  className?: string;
  position?: string;
};

export function FgiPoster({ photo, alt = "", className = "", position = "center 18%" }: Props) {
  return (
    <figure className={`fgi-poster ${className}`.trim()}>
      <img className="fgi-poster-sheet" src={FGI_POSTER_SRC} alt="" draggable={false} />
      <img
        className="fgi-poster-guest"
        src={photo}
        alt={alt}
        draggable={false}
        style={{ ...fgiPosterHoleCss(), objectPosition: position }}
      />
      <p className="fgi-poster-dates" style={fgiPosterDatesCss()}>
        <span>10e édition</span>
        <b>{FGI_POSTER_DATES}</b>
      </p>
    </figure>
  );
}
