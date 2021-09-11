import { BitmapFontData } from '../BitmapFontData';

const supportedFormats = ['msdf', 'mtsdf', 'sdf'];

/**
 * BitmapFont in msdf-atlas-gen JSON format
 *
 * @class
 * @private
 */
export class JSONFormat
{
    /**
     * Check if resource refers to json MSDF font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    static test(data: unknown): boolean
    {
        for (let i = 0; i < supportedFormats.length; i++)
        {
            const type: string = (data as Partial<MSDFJson>)?.atlas?.type;

            // console.log(type);
            if (type === supportedFormats[i])
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Convert the JSON into BitmapFontData that we can use.
     *
     * @static
     * @private
     * @param {MSDFJson} json
     * @return {BitmapFontData} Data to use for BitmapFont
     */
    static parse(json: MSDFJson): BitmapFontData
    {
        const data = new BitmapFontData();

        data.info = [{ face: json.name, size: json.metrics.emSize }];

        data.common = [{ lineHeight: json.metrics.lineHeight }];

        // msdf-atlas-gen doesn't support multiple textures
        data.page = [{ file: `${json.name}.png`, id: 0 }];

        for (let i = 0; i < json.glyphs.length; i++)
        {
            const letter = json.glyphs[i];

            const height =  Math.abs(letter.atlasBounds.top - letter.atlasBounds.bottom);
            let y = letter.atlasBounds.top;

            if (json.atlas.yOrigin === 'bottom')
            {
                y = height - y;
            }

            data.char.push({
                id: letter.unicode,
                page: 0,
                height,
                width: Math.abs(letter.atlasBounds.left - letter.atlasBounds.right),
                x: letter.atlasBounds.left,
                y,
                xadvance: letter.advance,
                xoffset: 0,
                yoffset: 0
            });
        }

        for (let i = 0; i < json.kerning.length; i++)
        {
            const pair = json.kerning[i];

            data.kerning.push({
                amount: pair.advance,
                first: pair.unicode1,
                second: pair.unicode2
            });
        }

        data.distanceField = [{ distanceRange: json.atlas.distanceRange, fieldType: json.atlas.type }];

        return data;
    }
}

interface Atlas {
    type: string;
    distanceRange: number;
    size: number;
    width: number;
    height: number;
    yOrigin: string;
}

interface Metrics {
    emSize: number;
    lineHeight: number;
    ascender: number;
    descender: number;
    underlineY: number;
    underlineThickness: number;
}

interface PlaneBounds {
    left: number;
    bottom: number;
    right: number;
    top: number;
}

interface AtlasBounds {
    left: number;
    bottom: number;
    right: number;
    top: number;
}

interface Glyph {
    unicode: number;
    advance: number;
    planeBounds?: PlaneBounds;
    atlasBounds?: AtlasBounds;
}

interface Kerning {
    unicode1: number;
    unicode2: number;
    advance: number;
}

interface MSDFJson {
    atlas: Atlas;
    name: string;
    metrics: Metrics;
    glyphs: Glyph[];
    kerning: Kerning[];
}
