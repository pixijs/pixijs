import { getContrast } from '../get/getContrast';
import { getLuminance } from '../get/getLuminance';
import { floor, round } from '../helpers';

import type { Plugin } from '../extend';
import type { AnyColor } from '../types';

// https://webaim.org/resources/contrastchecker/
interface ReadabilityOptions
{
    level?: 'AA' | 'AAA';
    size?: 'normal' | 'large';
}

declare module '../colord'
{
    interface Colord
    {
    /**
     * Returns the relative luminance of a color,
     * normalized to 0 for darkest black and 1 for lightest white.
     * https://www.w3.org/TR/WCAG20/#relativeluminancedef
     * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_Colors_and_Luminance
     */
        luminance(): number;
        /**
         * Calculates a contrast ratio for a color pair.
         * This luminance difference is expressed as a ratio ranging
         * from 1 (e.g. white on white) to 21 (e.g., black on a white).
         * WCAG requires a ratio of at least 4.5 for normal text and 3 for large text.
         * https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html
         * https://webaim.org/articles/contrast/
         */
        contrast(color2?: AnyColor | Colord): number;
        /**
         * Checks that a background and text color pair conforms to WCAG 2.0 requirements.
         * https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html
         */
        isReadable(color2?: AnyColor | Colord, options?: ReadabilityOptions): boolean;
    }
}

/**
 * A plugin adding accessibility and color contrast utilities.
 * Follows Web Content Accessibility Guidelines 2.0.
 * https://www.w3.org/TR/WCAG20/
 * @param ColordClass
 */
const a11yPlugin: Plugin = (ColordClass): void =>
{
    /**
     * Returns WCAG text color contrast requirement. Read explanation here https://webaim.org/resources/contrastchecker/
     * @param root0
     * @param root0.level
     * @param root0.size
     */
    const getMinimalContrast = ({ level = 'AA', size = 'normal' }: ReadabilityOptions) =>
    {
        if (level === 'AAA' && size === 'normal') return 7;
        if (level === 'AA' && size === 'large') return 3;

        return 4.5;
    };

    ColordClass.prototype.luminance = function ()
    {
        return round(getLuminance(this.rgba), 2);
    };

    ColordClass.prototype.contrast = function (color2 = '#FFF')
    {
        const instance2 = color2 instanceof ColordClass ? color2 : new ColordClass(color2);

        return floor(getContrast(this.rgba, instance2.toRgb()), 2);
    };

    ColordClass.prototype.isReadable = function (color2 = '#FFF', options = {})
    {
        return this.contrast(color2) >= getMinimalContrast(options);
    };
};

export default a11yPlugin;
