import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Container } from '../scene/container/Container';
import { Graphics } from '../scene/graphics/shared/Graphics';
import { GraphicsContext } from '../scene/graphics/shared/GraphicsContext';
import { Mesh } from '../scene/mesh/shared/Mesh';
import { Sprite } from '../scene/sprite/Sprite';
import { AnimatedSprite } from '../scene/sprite-animated/AnimatedSprite';
import { TilingSprite } from '../scene/sprite-tiling/TilingSprite';
import { Text } from '../scene/text/Text';
import { PrepareBase } from './PrepareBase';

import type { FillInstruction, TextureInstruction } from '../scene/graphics/shared/GraphicsContext';
import type { FrameObject } from '../scene/sprite-animated/AnimatedSprite';
import type { PrepareQueueItem, PrepareSourceItem } from './PrepareBase';

/**
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class extends the base functionality and resolves given resource items ready for the queue.
 * @memberof rendering
 */
export abstract class PrepareQueue extends PrepareBase
{
    /**
     * Resolve the given resource type and return an item for the queue
     * @param source
     * @param queue
     */
    protected resolveQueueItem(source: PrepareSourceItem, queue: PrepareQueueItem[]): void
    {
        if (source instanceof Container)
        {
            this.resolveContainerQueueItem(source, queue);
        }
        else if (source instanceof TextureSource || source instanceof Texture)
        {
            queue.push(source.source);
        }
        else if (source instanceof GraphicsContext)
        {
            queue.push(source);
        }

        // could not resolve the resource type
        return null;
    }

    /**
     * Resolve the given container and return an item for the queue
     * @param container
     * @param queue
     */
    protected resolveContainerQueueItem(container: Container, queue: PrepareQueueItem[]): void
    {
        // Note: we are just concerned with the given view.
        // Children are handled by the recursive call of the base class

        if (container instanceof Sprite || container instanceof TilingSprite || container instanceof Mesh)
        {
            queue.push(container.texture.source);
        }
        else if (container instanceof Text)
        {
            queue.push(container);
        }
        else if (container instanceof Graphics)
        {
            queue.push(container.context);
        }
        else if (container instanceof AnimatedSprite)
        {
            container.textures.forEach((textureOrFrame) =>
            {
                if ((textureOrFrame as Texture).source)
                {
                    queue.push((textureOrFrame as Texture).source);
                }
                else
                {
                    queue.push((textureOrFrame as FrameObject).texture.source);
                }
            });
        }
    }

    /**
     * Resolve the given graphics context and return an item for the queue
     * @param graphicsContext
     */
    protected resolveGraphicsContextQueueItem(graphicsContext: GraphicsContext): PrepareQueueItem | null
    {
        this.renderer.graphicsContext.getGpuContext(graphicsContext);

        const { instructions } = graphicsContext;

        for (const instruction of instructions)
        {
            if (instruction.action === 'texture')
            {
                const { image } = (instruction as TextureInstruction).data;

                return image.source;
            }
            else if (instruction.action === 'fill')
            {
                const { texture } = (instruction as FillInstruction).data.style;

                return texture.source;
            }
        }

        return null;
    }
}
