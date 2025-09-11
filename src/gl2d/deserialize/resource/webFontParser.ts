import { Assets } from '../../../assets/Assets';
import { Cache } from '../../../assets/cache/Cache';
import { type LoadFontData } from '../../../assets/loader/parsers/loadWebFont';
import { ExtensionType } from '../../../extensions/Extensions';
import { type GL2DWebFont } from '../../spec/resources';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DResourceParser } from '../parsers';

/**
 * Parser for GL2D webfont resources.
 * @internal
 */
export const gl2DWebFontParser: GL2DResourceParser<GL2DWebFont> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: GL2DWebFont): Promise<boolean>
    {
        return data.type === 'web_font';
    },

    async parse(data: GL2DWebFont): Promise<FontFace | FontFace[]>
    {
        const uri = data.uri;
        const fontFamily = data.family;

        // check if the resource is already loaded
        if (Cache.has(`${fontFamily}-and-url`))
        {
            return Cache.get<FontFace | FontFace[]>(`${fontFamily}-and-url`);
        }

        const formattedData: Required<LoadFontData> = {
            family: fontFamily,
            weights: data.weights,
            style: data.style,
            variant: data.variant,
            unicodeRange: data.unicodeRange,
            stretch: data.stretch,
            featureSettings: data.featureSettings,
            display: data.display,
        };

        return await Assets.load<FontFace | FontFace[]>({ src: uri, data: deepRemoveUndefinedOrNull(formattedData) });
    },
};
