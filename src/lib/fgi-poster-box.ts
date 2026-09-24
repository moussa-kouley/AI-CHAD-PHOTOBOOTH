/** Official FGI 10e édition poster — photo sits in the white window. */
export const FGI_POSTER_SRC = "/brand/fgi-poster.jpg";
export const FGI_POSTER_RATIO = "812 / 1024";
export const FGI_POSTER_DATES = "23–24 SEPTEMBER 2026";

export const FGI_POSTER_HOLE = {
  left: 0.125616,
  top: 0.230469,
  width: 0.722906,
  height: 0.611328,
} as const;

/** Sits in the gap under “10e ÉDITION”, above the photo window. */
export const FGI_POSTER_DATES_BOX = {
  left: 0.125616,
  top: 0.212,
  width: 0.722906,
} as const;

export function fgiPosterHoleCss() {
  return {
    left: `${FGI_POSTER_HOLE.left * 100}%`,
    top: `${FGI_POSTER_HOLE.top * 100}%`,
    width: `${FGI_POSTER_HOLE.width * 100}%`,
    height: `${FGI_POSTER_HOLE.height * 100}%`,
  };
}

export function fgiPosterDatesCss() {
  return {
    left: `${FGI_POSTER_DATES_BOX.left * 100}%`,
    top: `${FGI_POSTER_DATES_BOX.top * 100}%`,
    width: `${FGI_POSTER_DATES_BOX.width * 100}%`,
  };
}
