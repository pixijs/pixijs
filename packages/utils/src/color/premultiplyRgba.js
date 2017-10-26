/**
 * combines rgb and alpha to out array
 *
 * @param {Float32Array|number[]} rgb input rgb
 * @param {number} alpha alpha param
 * @param {Float32Array} [out] output
 * @param {boolean} [premultiply=true] do premultiply it
 * @returns {Float32Array} vec4 rgba
 */
export function premultiplyRgba(rgb, alpha, out, premultiply)
{
    out = out || new Float32Array(4);
    if (premultiply || premultiply === undefined)
    {
        out[0] = rgb[0] * alpha;
        out[1] = rgb[1] * alpha;
        out[2] = rgb[2] * alpha;
    }
    else
    {
        out[0] = rgb[0];
        out[1] = rgb[1];
        out[2] = rgb[2];
    }
    out[3] = alpha;

    return out;
}
