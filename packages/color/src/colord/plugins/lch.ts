import { parseLcha, rgbaToLcha, roundLcha } from '../colorModels/lch';
import { parseLchaString, rgbaToLchaString } from '../colorModels/lchString';

import type { Plugin } from '../extend';
import type { LchaColor } from '../types';

declare module '../colord'
{
    interface Colord
    {
    /**
     * Converts a color to CIELCH (Lightness-Chroma-Hue) color space and returns an object.
     * https://lea.verou.me/2020/04/lch-colors-in-css-what-why-and-how/
     * https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_model
     */
        toLch(): LchaColor;
        /**
         * Converts a color to CIELCH (Lightness-Chroma-Hue) color space and returns a string.
         * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch()
         */
        toLchString(): string;
    }
}

/**
 * A plugin adding support for CIELCH color space.
 * https://lea.verou.me/2020/04/lch-colors-in-css-what-why-and-how/
 * https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_model
 * @param ColordClass
 * @param parsers
 */
const lchPlugin: Plugin = (ColordClass, parsers): void =>
{
    ColordClass.prototype.toLch = function ()
    {
        return roundLcha(rgbaToLcha(this.rgba));
    };

    ColordClass.prototype.toLchString = function ()
    {
        return rgbaToLchaString(this.rgba);
    };

    parsers.string.push([parseLchaString, 'lch']);
    parsers.object.push([parseLcha, 'lch']);
};

export default lchPlugin;
