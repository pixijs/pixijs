import type { Plugin } from '../extend';
import type { ParseFunction, RgbaColor } from '../types';

interface ConvertOptions
{
    closest?: boolean;
}

declare module '../colord'
{
    interface Colord
    {
    /** Finds CSS color keyword that matches with the color value */
        toName(options?: ConvertOptions): string | undefined;
    }
}

/**
 * Plugin to work with named colors.
 * Adds a parser to read CSS color names and `toName` method.
 * See https://www.w3.org/TR/css-color-4/#named-colors
 * Supports 'transparent' string as defined in
 * https://drafts.csswg.org/css-color/#transparent-color
 * @param ColordClass
 * @param parsers
 */
const namesPlugin: Plugin = (ColordClass, parsers): void =>
{
    // The default CSS color names dictionary
    // The properties order is optimized for better compression
    const NAME_HEX_STORE: Record<string, string> = {
        white: '#ffffff',
        bisque: '#ffe4c4',
        blue: '#0000ff',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        azure: '#f0ffff',
        whitesmoke: '#f5f5f5',
        papayawhip: '#ffefd5',
        plum: '#dda0dd',
        blanchedalmond: '#ffebcd',
        black: '#000000',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gainsboro: '#dcdcdc',
        cornsilk: '#fff8dc',
        cornflowerblue: '#6495ed',
        burlywood: '#deb887',
        aquamarine: '#7fffd4',
        beige: '#f5f5dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkkhaki: '#bdb76b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        peachpuff: '#ffdab9',
        darkmagenta: '#8b008b',
        darkred: '#8b0000',
        darkorchid: '#9932cc',
        darkorange: '#ff8c00',
        darkslateblue: '#483d8b',
        gray: '#808080',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        wheat: '#f5deb3',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        ghostwhite: '#f8f8ff',
        darkviolet: '#9400d3',
        magenta: '#ff00ff',
        green: '#008000',
        dodgerblue: '#1e90ff',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        blueviolet: '#8a2be2',
        forestgreen: '#228b22',
        lawngreen: '#7cfc00',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        fuchsia: '#ff00ff',
        brown: '#a52a2a',
        maroon: '#800000',
        mediumblue: '#0000cd',
        lightcoral: '#f08080',
        darkturquoise: '#00ced1',
        lightcyan: '#e0ffff',
        ivory: '#fffff0',
        lightyellow: '#ffffe0',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        linen: '#faf0e6',
        mediumaquamarine: '#66cdaa',
        lemonchiffon: '#fffacd',
        lime: '#00ff00',
        khaki: '#f0e68c',
        mediumseagreen: '#3cb371',
        limegreen: '#32cd32',
        mediumspringgreen: '#00fa9a',
        lightskyblue: '#87cefa',
        lightblue: '#add8e6',
        midnightblue: '#191970',
        lightpink: '#ffb6c1',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        mintcream: '#f5fffa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        navajowhite: '#ffdead',
        navy: '#000080',
        mediumvioletred: '#c71585',
        powderblue: '#b0e0e6',
        palegoldenrod: '#eee8aa',
        oldlace: '#fdf5e6',
        paleturquoise: '#afeeee',
        mediumturquoise: '#48d1cc',
        mediumorchid: '#ba55d3',
        rebeccapurple: '#663399',
        lightsteelblue: '#b0c4de',
        mediumslateblue: '#7b68ee',
        thistle: '#d8bfd8',
        tan: '#d2b48c',
        orchid: '#da70d6',
        mediumpurple: '#9370db',
        purple: '#800080',
        pink: '#ffc0cb',
        skyblue: '#87ceeb',
        springgreen: '#00ff7f',
        palegreen: '#98fb98',
        red: '#ff0000',
        yellow: '#ffff00',
        slateblue: '#6a5acd',
        lavenderblush: '#fff0f5',
        peru: '#cd853f',
        palevioletred: '#db7093',
        violet: '#ee82ee',
        teal: '#008080',
        slategray: '#708090',
        slategrey: '#708090',
        aliceblue: '#f0f8ff',
        darkseagreen: '#8fbc8f',
        darkolivegreen: '#556b2f',
        greenyellow: '#adff2f',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        tomato: '#ff6347',
        silver: '#c0c0c0',
        sienna: '#a0522d',
        lavender: '#e6e6fa',
        lightgreen: '#90ee90',
        orange: '#ffa500',
        orangered: '#ff4500',
        steelblue: '#4682b4',
        royalblue: '#4169e1',
        turquoise: '#40e0d0',
        yellowgreen: '#9acd32',
        salmon: '#fa8072',
        saddlebrown: '#8b4513',
        sandybrown: '#f4a460',
        rosybrown: '#bc8f8f',
        darksalmon: '#e9967a',
        lightgoldenrodyellow: '#fafad2',
        snow: '#fffafa',
        lightgrey: '#d3d3d3',
        lightgray: '#d3d3d3',
        dimgray: '#696969',
        dimgrey: '#696969',
        olivedrab: '#6b8e23',
        olive: '#808000',
    };

    // Second dictionary to provide faster search by HEX value
    const HEX_NAME_STORE: Record<string, string> = {};

    for (const name in NAME_HEX_STORE) HEX_NAME_STORE[NAME_HEX_STORE[name]] = name;

    // Third dictionary to cache RGBA values (useful for distance calculation)
    const NAME_RGBA_STORE: Record<string, RgbaColor> = {};

    // Finds a distance between two colors
    // See https://www.wikiwand.com/en/Color_difference
    const getDistanceBetween = (rgb1: RgbaColor, rgb2: RgbaColor) =>
        (rgb1.r - rgb2.r) ** 2 + (rgb1.g - rgb2.g) ** 2 + (rgb1.b - rgb2.b) ** 2;

    // Define new color conversion method
    ColordClass.prototype.toName = function (options)
    {
    // Process "transparent" keyword
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#transparent_keyword
        if (!this.rgba.a && !this.rgba.r && !this.rgba.g && !this.rgba.b) return 'transparent';

        // Return exact match right away
        const exactMatch = HEX_NAME_STORE[this.toHex()];

        if (exactMatch) return exactMatch;

        // Find closest color, if there is no exact match and `approximate` flag enabled
        if (options?.closest)
        {
            const rgba = this.toRgb();
            let minDistance = Infinity;
            let closestMatch = 'black';

            // Fill the dictionary if empty
            if (!NAME_RGBA_STORE.length)
            {
                for (const name in NAME_HEX_STORE)
                {
                    NAME_RGBA_STORE[name] = new ColordClass(NAME_HEX_STORE[name]).toRgb();
                }
            }

            // Find the closest color
            for (const name in NAME_HEX_STORE)
            {
                const distance = getDistanceBetween(rgba, NAME_RGBA_STORE[name]);

                if (distance < minDistance)
                {
                    minDistance = distance;
                    closestMatch = name;
                }
            }

            return closestMatch;
        }

        return undefined;
    };

    // Add CSS color names parser
    const parseColorName: ParseFunction<string> = (input: string): RgbaColor | null =>
    {
    // the color names are case-insensitive according to CSS Color Level 3
        const name = input.toLowerCase();
        // "transparent" is a shorthand for transparent black
        const hex = name === 'transparent' ? '#0000' : NAME_HEX_STORE[name];

        if (hex) return new ColordClass(hex).toRgb();

        return null;
    };

    parsers.string.push([parseColorName, 'name']);
};

export default namesPlugin;
