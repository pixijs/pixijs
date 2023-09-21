import { parseHex } from './colorModels/hex';
import { parseHsla } from './colorModels/hsl';
import { parseHslaString } from './colorModels/hslString';
import { parseHsva } from './colorModels/hsv';
import { parseRgba } from './colorModels/rgb';
import { parseRgbaString } from './colorModels/rgbString';

import type { Format, Input, InputObject, Parser, ParseResult, Parsers } from './types';

// The built-in input parsing functions.
// We use array instead of object to keep the bundle size lighter.
export const parsers: Parsers = {
    string: [
        [parseHex, 'hex'],
        [parseRgbaString, 'rgb'],
        [parseHslaString, 'hsl'],
    ],
    object: [
        [parseRgba, 'rgb'],
        [parseHsla, 'hsl'],
        [parseHsva, 'hsv'],
    ],
};

const findValidColor = <I extends Input>(
    input: I,
    parsers: Parser<I>[]
): ParseResult | [null, undefined] =>
{
    for (let index = 0; index < parsers.length; index++)
    {
        const result = parsers[index][0](input);

        if (result) return [result, parsers[index][1]];
    }

    return [null, undefined];
};

/**
 * Tries to convert an incoming value into RGBA color by going through all color model parsers
 * @param input
 */
export const parse = (input: Input): ParseResult | [null, undefined] =>
{
    if (typeof input === 'string')
    {
        return findValidColor<string>(input.trim(), parsers.string);
    }

    // Don't forget that the type of `null` is "object" in JavaScript
    // https://bitsofco.de/javascript-typeof/
    if (typeof input === 'object' && input !== null)
    {
        return findValidColor<InputObject>(input, parsers.object);
    }

    return [null, undefined];
};

/**
 * Returns a color model name for the input passed to the function.
 * @param input
 */
export const getFormat = (input: Input): Format | undefined => parse(input)[1];
