import { parseHwba, rgbaToHwba, roundHwba } from '../colorModels/hwb';
import { parseHwbaString, rgbaToHwbaString } from '../colorModels/hwbString';

import type { Plugin } from '../extend';
import type { HwbaColor } from '../types';

declare module '../colord'
{
    interface Colord
    {
    /**
     * Converts a color to HWB (Hue-Whiteness-Blackness) color space and returns an object.
     * https://en.wikipedia.org/wiki/HWB_color_model
     */
        toHwb(): HwbaColor;
        /**
         * Converts a color to HWB (Hue-Whiteness-Blackness) color space and returns a string.
         * https://www.w3.org/TR/css-color-4/#the-hwb-notation
         */
        toHwbString(): string;
    }
}

/**
 * A plugin adding support for HWB (Hue-Whiteness-Blackness) color model.
 * https://en.wikipedia.org/wiki/HWB_color_model
 * https://www.w3.org/TR/css-color-4/#the-hwb-notation
 * @param ColordClass
 * @param parsers
 */
const hwbPlugin: Plugin = (ColordClass, parsers): void =>
{
    ColordClass.prototype.toHwb = function ()
    {
        return roundHwba(rgbaToHwba(this.rgba));
    };

    ColordClass.prototype.toHwbString = function ()
    {
        return rgbaToHwbaString(this.rgba);
    };

    parsers.string.push([parseHwbaString, 'hwb']);
    parsers.object.push([parseHwba, 'hwb']);
};

export default hwbPlugin;
