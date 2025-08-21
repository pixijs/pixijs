import { ExtensionType } from '../../../extensions/Extensions';
import { Sprite } from '../../../scene/sprite/Sprite';
import { type PixiGL2DSprite } from '../../extensions/nodes';
import { type GL2DNode } from '../../node';
import { type GL2DNodeParser } from '../parsers';
import { applyBaseNodeProperties } from './containerParser';

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

        const sprite = new Sprite(texture);

        // Apply base node properties
        applyBaseNodeProperties(sprite, data);

        // Apply container extension properties
        const containerExtension = data.extensions?.pixi_container_node;

        if (containerExtension)
        {
            sprite.anchor.set(containerExtension.anchor[0], containerExtension.anchor[1]);
            sprite.zIndex = containerExtension.zIndex ?? 0;
            sprite.renderable = containerExtension.renderable ?? true;
        }

        // Apply sprite-specific properties
        const spriteExtension = data.extensions?.pixi_sprite_node;

        if (spriteExtension)
        {
            sprite.roundPixels = spriteExtension.roundPixels ?? false;
        }

        return sprite;
    }
};
