import { ExtensionType } from '../../../extensions/Extensions';
import { Sprite, type SpriteOptions } from '../../../scene/sprite/Sprite';
import { type PixiGL2DSprite } from '../../extensions/nodes';
import { type GL2DNode } from '../../node';
import { deepRemoveUndefinedOrNull } from '../../utils/deepRemoveUndefinedOrNull';
import { type GL2DNodeParser } from '../parsers';
import { toPointData } from '../utils/arrayTo';
import { createContainerOptionsFromGl2D, setContainerTransformFromGL2D } from './containerParser';

import type { ContainerOptions } from '../../../scene/container/Container';

/**
 * Parser for GL2D sprite nodes.
 * @internal
 */
export const gl2DSpriteNodeParser: GL2DNodeParser<PixiGL2DSprite> = {
    extension: ExtensionType.GL2DNodeParser,

    async test(data: GL2DNode): Promise<boolean>
    {
        return data.type === 'sprite';
    },

    async parse(data: PixiGL2DSprite, resourceCache: any[]): Promise<Sprite>
    {
        const texture = resourceCache[data.texture];

        if (!texture)
        {
            throw new Error(`Texture at index ${data.texture} not found`);
        }

        const properties: Required<Omit<SpriteOptions, keyof ContainerOptions>> = deepRemoveUndefinedOrNull(
            {
                ...createContainerOptionsFromGl2D(data),
                texture,
                anchor: toPointData(data.extensions?.pixi_container_node?.anchor),
                roundPixels: data.extensions?.pixi_sprite_node?.roundPixels,
            },
            1,
        );

        const sprite = new Sprite(properties);

        // Apply base node properties
        setContainerTransformFromGL2D(sprite, data);

        return sprite;
    },
};
