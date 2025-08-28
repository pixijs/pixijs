import { Assets } from '../../../assets/Assets';
import { Cache } from '../../../assets/cache/Cache';
import { ExtensionType } from '../../../extensions/Extensions';
import { type BitmapFont } from '../../../scene/text-bitmap/BitmapFont';
import { type GL2DBitmapFont } from '../../spec/resources';
import { type GL2DResourceParser } from '../parsers';

/**
 * Parser for GL2D bitmapFont resources.
 * @internal
 */
export const gl2DBitmapFontParser: GL2DResourceParser<GL2DBitmapFont> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: GL2DBitmapFont): Promise<boolean>
    {
        return data.type === 'bitmap_font';
    },

    async parse(data: GL2DBitmapFont): Promise<BitmapFont>
    {
        const uri = data.uri;
        const fontFamily = data.fontFamily;

        // check if the resource is already loaded
        if (Cache.has(`${fontFamily}-bitmap`))
        {
            return Cache.get<BitmapFont>(`${fontFamily}-bitmap`);
        }

        return await Assets.load<BitmapFont>({ src: uri });
    },
};
