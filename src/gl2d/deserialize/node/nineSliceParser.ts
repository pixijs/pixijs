import { ExtensionType } from '../../../extensions/Extensions';
import {
    createContainerOptionsFromGl2D,
    setContainerTransformFromGL2D,
} from '../../../gl2d/deserialize/node/containerParser';
import { type GL2DNodeParser } from '../../../gl2d/deserialize/parsers';
import { toPointData } from '../../../gl2d/deserialize/utils/arrayTo';
import { type ContainerOptions } from '../../../scene/container/Container';
import { NineSliceSprite, type NineSliceSpriteOptions } from '../../../scene/sprite-nine-slice/NineSliceSprite';
import { type PixiGL2DNineSliceSprite } from '../../spec/extensions/nodes';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';

/**
 * Parser for GL2D nine slice sprite nodes.
 * @internal
 */
export const gl2DNineSliceSpriteNodeParser: GL2DNodeParser<PixiGL2DNineSliceSprite> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: PixiGL2DNineSliceSprite): Promise<boolean>
    {
        return data.type === 'nine_slice_sprite';
    },

    async parse(data: PixiGL2DNineSliceSprite, resourceCache: any[]): Promise<NineSliceSprite>
    {
        const texture = resourceCache[data.texture];

        if (!texture)
        {
            throw new Error(`Texture at index ${data.texture} not found`);
        }

        const leftWidth = data.slice9 ? data.slice9[0] : data.leftWidth;
        const rightWidth = data.slice9 ? data.slice9[1] : data.rightWidth;
        const topHeight = data.slice9 ? data.slice9[2] : data.topHeight;
        const bottomHeight = data.slice9 ? data.slice9[3] : data.bottomHeight;

        const properties: Required<Omit<NineSliceSpriteOptions, keyof ContainerOptions>>
            = {
                ...createContainerOptionsFromGl2D(data),
                texture,
                ...deepRemoveUndefinedOrNull({
                    anchor: toPointData(data.extensions?.pixi_container_node?.anchor),
                    roundPixels: data.extensions?.pixi_nine_slice_sprite_node?.roundPixels,
                    leftWidth,
                    rightWidth,
                    topHeight,
                    bottomHeight,
                }, 1)
            };

        const sprite = new NineSliceSprite(properties);

        // Apply base node properties
        setContainerTransformFromGL2D(sprite, data);

        return sprite;
    },
};
