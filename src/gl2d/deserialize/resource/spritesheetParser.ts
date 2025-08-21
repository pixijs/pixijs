import { Assets } from '../../../assets/Assets';
import { Cache } from '../../../assets/cache/Cache';
import { ExtensionType } from '../../../extensions/Extensions';
import {
    type TextureSource
} from '../../../rendering/renderers/shared/texture/sources/TextureSource';
import { type Texture } from '../../../rendering/renderers/shared/texture/Texture';
import { type Spritesheet } from '../../../spritesheet/Spritesheet';
import { type SpriteSheetParseOptions } from '../../../spritesheet/spritesheetAsset';
import {
    type PixiGL2DSpritesheetSource
} from '../../extensions/resources';
import { GL2D } from '../../GL2D';
import { type GL2DResource } from '../../resources';
import { type GL2DResourceParser } from '../parsers';

/**
 * Parser for GL2D spritesheet resources.
 * @private
 */
export const gl2DSpritesheetParser: GL2DResourceParser<PixiGL2DSpritesheetSource> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: PixiGL2DSpritesheetSource): Promise<boolean>
    {
        return data.type === 'spritesheet';
    },

    async parse(data: PixiGL2DSpritesheetSource, resources: GL2DResource[], serializedAssets): Promise<Spritesheet>
    {
        const uri = data.uri;

        // check if the resource is already loaded
        if (Cache.has(uri))
        {
            return Cache.get<Spritesheet>(uri);
        }

        let existingSource = serializedAssets[data.source] as TextureSource;

        if (!existingSource)
        {
            // load the resource we need as it is not already loaded due to being later on in the array
            await GL2D.parseResource(resources[data.source], resources, serializedAssets);
        }

        existingSource = serializedAssets[data.source];

        const formattedData: SpriteSheetParseOptions = {
            // TODO: fix ugly type hack
            texture: { source: existingSource, isTexture: true } as unknown as Texture,
            cachePrefix: data.extensions?.pixi_spritesheet_resource?.cachePrefix,
        };

        return (await Assets.load<Spritesheet>({ src: uri, data: formattedData }));
    },
};
