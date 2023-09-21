import { parseXyza, rgbaToXyza, roundXyza } from '../colorModels/xyz';

import type { Plugin } from '../extend';
import type { XyzaColor } from '../types';

declare module '../colord'
{
    interface Colord
    {
        toXyz(): XyzaColor;
    }
}

/**
 * A plugin adding support for CIE XYZ colorspace.
 * Wikipedia: https://en.wikipedia.org/wiki/CIE_1931_color_space
 * Helpful article: https://www.sttmedia.com/colormodel-xyz
 * @param ColordClass
 * @param parsers
 */
const xyzPlugin: Plugin = (ColordClass, parsers): void =>
{
    ColordClass.prototype.toXyz = function ()
    {
        return roundXyza(rgbaToXyza(this.rgba));
    };

    parsers.object.push([parseXyza, 'xyz']);
};

export default xyzPlugin;
