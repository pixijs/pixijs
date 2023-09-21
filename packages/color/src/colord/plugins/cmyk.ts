import { parseCmyka, rgbaToCmyka, roundCmyka } from '../colorModels/cmyk';
import { parseCmykaString, rgbaToCmykaString } from '../colorModels/cmykString';

import type { Plugin } from '../extend';
import type { CmykaColor } from '../types';

declare module '../colord'
{
    interface Colord
    {
    /**
     * Converts a color to CMYK color space and returns an object.
     * https://drafts.csswg.org/css-color/#cmyk-colors
     * https://lea.verou.me/2009/03/cmyk-colors-in-css-useful-or-useless/
     */
        toCmyk(): CmykaColor;
        /**
         * Converts a color to CMYK color space and returns a string.
         * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/device-cmyk()
         */
        toCmykString(): string;
    }
}

/**
 * A plugin adding support for CMYK color space.
 * https://lea.verou.me/2009/03/cmyk-colors-in-css-useful-or-useless/
 * https://en.wikipedia.org/wiki/CMYK_color_model
 * @param ColordClass
 * @param parsers
 */
const cmykPlugin: Plugin = (ColordClass, parsers): void =>
{
    ColordClass.prototype.toCmyk = function ()
    {
        return roundCmyka(rgbaToCmyka(this.rgba));
    };

    ColordClass.prototype.toCmykString = function ()
    {
        return rgbaToCmykaString(this.rgba);
    };

    parsers.object.push([parseCmyka, 'cmyk']);
    parsers.string.push([parseCmykaString, 'cmyk']);
};

export default cmykPlugin;
