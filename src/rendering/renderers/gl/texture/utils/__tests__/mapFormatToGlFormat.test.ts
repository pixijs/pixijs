import { mapFormatToGlFormat } from '../mapFormatToGlFormat';

import type { GlRenderingContext } from '../../../context/GlRenderingContext';

describe('mapFormatToGlFormat', () =>
{
    // every gl constant reads back as its own name, so the map shows which constant it chose
    const gl = new Proxy({}, { get: (_, name) => name }) as unknown as GlRenderingContext;
    const map = mapFormatToGlFormat(gl) as unknown as Record<string, string>;
    const isInteger = (format: string) => format.endsWith('int');

    it('should map every integer format to an _INTEGER pixel format with matching channels', () =>
    {
        const integerFormats = Object.keys(map).filter(isInteger);

        expect(Object.fromEntries(integerFormats.map((format) => [format, map[format]]))).toEqual({
            r8uint: 'RED_INTEGER',
            r8sint: 'RED_INTEGER',
            r16uint: 'RED_INTEGER',
            r16sint: 'RED_INTEGER',
            r32uint: 'RED_INTEGER',
            r32sint: 'RED_INTEGER',
            rg8uint: 'RG_INTEGER',
            rg8sint: 'RG_INTEGER',
            rg16uint: 'RG_INTEGER',
            rg16sint: 'RG_INTEGER',
            rg32uint: 'RG_INTEGER',
            rg32sint: 'RG_INTEGER',
            rgba8uint: 'RGBA_INTEGER',
            rgba8sint: 'RGBA_INTEGER',
            rgba16uint: 'RGBA_INTEGER',
            rgba16sint: 'RGBA_INTEGER',
            rgba32uint: 'RGBA_INTEGER',
            rgba32sint: 'RGBA_INTEGER',
        });
    });

    it('should not map normalized or float formats to _INTEGER pixel formats', () =>
    {
        const otherFormats = Object.keys(map).filter((format) => !isInteger(format));

        expect(otherFormats.filter((format) => map[format].endsWith('_INTEGER'))).toEqual([]);
    });
});
