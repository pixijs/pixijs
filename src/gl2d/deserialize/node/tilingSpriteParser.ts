import { ExtensionType } from '../../../extensions/Extensions';
import {
    createContainerOptionsFromGl2D,
    setContainerTransformFromGL2D,
} from '../../../gl2d/deserialize/node/containerParser';
import { type GL2DNodeParser } from '../../../gl2d/deserialize/parsers';
import { toPointData } from '../../../gl2d/deserialize/utils/arrayTo';
import { deepRemoveUndefinedOrNull } from '../../../gl2d/utils/deepRemoveUndefinedOrNull';
import { type ContainerOptions } from '../../../scene/container/Container';
import { TilingSprite, type TilingSpriteOptions } from '../../../scene/sprite-tiling/TilingSprite';
import { type PixiGL2DTilingSprite } from '../../spec/extensions/nodes';

/**
 * Parser for GL2D tiling sprite nodes.
 * @internal
 */
export const gl2DTilingSpriteNodeParser: GL2DNodeParser<PixiGL2DTilingSprite> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: PixiGL2DTilingSprite): Promise<boolean>
    {
        return data.type === 'tiling_sprite';
    },

    async parse(data: PixiGL2DTilingSprite, resourceCache: any[]): Promise<TilingSprite>
    {
        const texture = resourceCache[data.texture];

        if (!texture)
        {
            throw new Error(`Texture at index ${data.texture} not found`);
        }

        const properties: Required<Omit<TilingSpriteOptions, keyof ContainerOptions>> = {
            ...createContainerOptionsFromGl2D(data),
            ...deepRemoveUndefinedOrNull({
                texture,
                anchor: toPointData(data.extensions?.pixi_container_node?.anchor),
                tilePosition: toPointData(data.tilePosition),
                tileScale: toPointData(data.tileScale),
                tileRotation: data.tileRotation,
                applyAnchorToTexture: data.extensions?.pixi_tiling_sprite_node?.applyAnchorToTexture,
                roundPixels: data.extensions?.pixi_tiling_sprite_node?.roundPixels,
            }, 1)
        };

        const sprite = new TilingSprite(properties);

        // Apply base node properties
        setContainerTransformFromGL2D(sprite, data);

        return sprite;
    },
};
