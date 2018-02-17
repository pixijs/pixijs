'use strict';

/**
 * equality that takes into account flips and multiplied alpha
 * @param {PIXI.extract.CanvasData} arg1 the other canvas data
 * @param {PIXI.extract.CanvasData} arg2 the other canvas data
 * @returns {boolean} result
 */

/* eslint-disable no-console */
module.exports = function equals(arg1, arg2)
{
    const w = arg1.width;
    const h = arg1.height;

    if (w !== arg2.width || h !== arg2.height)
    {
        console.log(`received ${w} x ${h}, expected ${arg2.width} x ${arg2.height} `);

        return false;
    }

    const pixels1 = arg1.pixels;
    const pixels2 = arg2.pixels;

    for (let y = 0; y < h; y++)
    {
        const offset1 = w * (arg1.flipY ? h - 1 - y : y);
        const offset2 = w * (arg2.flipY ? h - 1 - y : y);

        for (let x = 0; x < w; x++)
        {
            const ind1 = (x + offset1) << 2;
            const ind2 = (x + offset2) << 2;
            let alpha1 = pixels1[ind1 + 3];
            let alpha2 = pixels2[ind2 + 3];

            if (Math.abs(alpha1 - alpha2) > 1.0)
            {
                console.log(`Image comparsion: alpha fail, x=${x} y=${y}, a1=${alpha1} a2=${alpha2}`);

                return false;
            }

            alpha1 = arg1.premultiplyAlpha ? 1.0 : (alpha1 / 255.0);
            alpha2 = arg2.premultiplyAlpha ? 1.0 : (alpha2 / 255.0);

            for (let t = 0; t < 3; t++)
            {
                const R1 = Math.round(pixels1[ind1] * alpha1);
                const R2 = Math.round(pixels2[ind2] * alpha2);

                if (Math.abs(R1 - R2) > 1)
                {
                    console.log(`Image comparsion: color fail x=${x} y=${y}, a1=${alpha1}, a2=${alpha2}, 
                    p1=${pixels1[ind1]}, p2=${pixels2[ind2]},
                    R1=${R1} R2=${R2}`);

                    return false;
                }
            }
        }
    }

    return true;
};
