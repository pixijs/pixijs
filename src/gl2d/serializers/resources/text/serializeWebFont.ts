import { Cache } from '../../../../assets/cache/Cache';
import { type FontFaceCache } from '../../../../assets/loader/parsers/loadWebFont';
import { WEB_FONT_DEFAULTS } from '../../../defaults';
import { type Gl2dRef } from '../../../types/Gl2dTypes';
import { type Gl2dPixiWebFontResource } from '../../../types/pixi/PixiGl2dResources';
import { gl2dUtils } from '../../../utils';

import type { Gl2dSerializeContext } from '../../../serializeContext';

/**
 * Serializes a web font resource from a font family name.
 * Looks up the font in the PixiJS Cache and creates web_font resources.
 * @param fontFamily - The font family name or array of font family names
 * @param ctx - The serialization context
 * @returns Index into ctx.gl2d.resources, or undefined if font not cached
 * @category gl2d
 * @internal
 */
export function serializeWebFont(fontFamily: string | string[], ctx: Gl2dSerializeContext): Gl2dRef | Gl2dRef[] | undefined
{
    const cleaned = gl2dUtils.cleanFontFamily(fontFamily);
    const families = Array.isArray(cleaned) ? cleaned : [cleaned];

    const indices: Gl2dRef[] = [];

    for (const family of families)
    {
        if (!Cache.has(`${family}-and-url`)) continue;

        const cached = Cache.get<FontFaceCache>(`${family}-and-url`);

        for (const entry of cached.entries)
        {
            const existing = ctx.resourceMap.get(entry);

            if (existing !== undefined)
            {
                indices.push(existing);
                continue;
            }

            const resource = gl2dUtils.compact<Gl2dPixiWebFontResource>({
                type: 'web_font',
                uid: `web_font_${family}_${ctx.gl2d.resources.length}`,
                name: family,
                family,
                uri: entry.url,
                weights: gl2dUtils.checkArrayEquals(entry.faces.map((face) => face.weight), WEB_FONT_DEFAULTS.weights),
                style: gl2dUtils.checkValue(entry.faces[0]?.style, WEB_FONT_DEFAULTS.style),
                display: gl2dUtils.checkValue(entry.faces[0]?.display, WEB_FONT_DEFAULTS.display),
                stretch: gl2dUtils.checkValue(entry.faces[0]?.stretch, WEB_FONT_DEFAULTS.stretch),
                unicodeRange: gl2dUtils.checkValue(entry.faces[0]?.unicodeRange, WEB_FONT_DEFAULTS.unicodeRange),
                featureSettings: gl2dUtils.checkValue(entry.faces[0]?.featureSettings, WEB_FONT_DEFAULTS.featureSettings),
            });

            const index = ctx.gl2d.resources.length;

            ctx.gl2d.resources.push(resource);
            ctx.resourceMap.set(entry, index);
            indices.push(index);
        }
    }

    if (indices.length === 0) return undefined;

    return indices.length === 1 ? indices[0] : indices;
}
