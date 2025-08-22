import { ExtensionType } from '../../../extensions/Extensions';
import { type Rectangle } from '../../../maths/shapes/Rectangle';
import { Texture, type TextureOptions } from '../../../rendering/renderers/shared/texture/Texture';
import { type Spritesheet } from '../../../spritesheet/Spritesheet';
import { GL2D } from '../../GL2D';
import { type PixiGL2DTexture } from '../../spec/extensions/resources';
import { type GL2DResource } from '../../spec/resources';
import { type GL2DResourceParser } from '../parsers';
import { toPointData, toRectangle } from '../utils/arrayTo';

function frameEqual(frameA: Rectangle, frameB: Rectangle): boolean
{
    if (frameB === frameA)
    {
        return true;
    }

    return (
        frameB
        && frameA.x === frameB.x
        && frameA.y === frameB.y
        && frameA.width === frameB.width
        && frameA.height === frameB.height
    );
}

/**
 * Parser for GL2D texture resources.
 * @internal
 */
export const gl2DTextureParser: GL2DResourceParser<any> = {
    extension: ExtensionType.GL2DResourceParser,

    async test(data: GL2DResource): Promise<boolean>
    {
        return data.type === 'texture';
    },

    async parse(data: PixiGL2DTexture, resources: GL2DResource[], serializedAssets: any[]): Promise<Texture>
    {
        let existingSource = serializedAssets[data.source] as Texture | Spritesheet;

        if (!existingSource)
        {
            // load the resource we need as it is not already loaded due to being later on in the array
            await GL2D.parseResource(resources[data.source], resources, serializedAssets);
        }

        existingSource = serializedAssets[data.source];

        const frame = toRectangle(data.frame);

        if (frame && 'parse' in existingSource)
        {
            // find the texture in the spritesheet
            return Object.values(existingSource.textures).find((texture: Texture) => frameEqual(texture.frame, frame));
        }

        // check if the texture already exists
        // if (Cache.has(resources[data.source].uri))
        // {
        //     return Cache.get(resources[data.source].uri) as Texture;
        // }

        const textureData: TextureOptions = {
            source: (existingSource as Texture).source,
            frame,
            trim: toRectangle(data.extensions?.pixi_texture_resource?.trim),
            defaultAnchor: toPointData(data.extensions?.pixi_texture_resource?.defaultAnchor),
            defaultBorders: toRectangle(data.extensions?.pixi_texture_resource?.defaultBorders),
            rotate: data.extensions?.pixi_texture_resource?.rotate,
            orig: toRectangle(data.extensions?.pixi_texture_resource?.orig),
            label: data.name,
            dynamic: data.extensions?.pixi_texture_resource?.dynamic,
        };

        return new Texture(textureData);
    },
};
