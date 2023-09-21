/**
 * We used to work with 2 digits after the decimal point, but it wasn't accurate enough,
 * so the library produced colors that were perceived differently.
 */
export const ALPHA_PRECISION = 3;

/** Valid CSS <angle> units. https://developer.mozilla.org/en-US/docs/Web/CSS/angle */
export const ANGLE_UNITS: Record<string, number> = {
    grad: 360 / 400,
    turn: 360,
    rad: 360 / (Math.PI * 2),
};
