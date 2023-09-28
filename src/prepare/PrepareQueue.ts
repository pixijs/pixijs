import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { Container } from '../scene/container/Container';
import { GraphicsContext } from '../scene/graphics/shared/GraphicsContext';
import { Text } from '../scene/text/Text';
import { PrepareBase } from './PrepareBase';

import type { PrepareQueueItem, PrepareSourceItem } from './PrepareBase';

/**
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class extends the base functionality and resolves given resource items ready for the queue.
 */
export abstract class PrepareQueue extends PrepareBase
{
    /**
     * Resolve the given resource type and return an item for the queue
     * @param source
     */
    protected resolveQueueItem(source: PrepareSourceItem): PrepareQueueItem | null
    {
        if (source instanceof Container)
        {
            return this.resolveContainerQueueItem(source);
        }
        else if (source instanceof TextureSource)
        {
            return source;
        }
        else if (source instanceof Texture)
        {
            return source.source;
        }
        else if (source instanceof GraphicsContext)
        {
            return source;
        }

        // could not resolve the resource type
        return null;
    }

    /**
     * Resolve the given container and return an item for the queue
     * @param container
     */
    protected resolveContainerQueueItem(container: Container): PrepareQueueItem | null
    {
        // Note: we are just concerned with the given container, not its children.
        //       Children are handled by the recursive call of the base class

        if (container instanceof Text)
        {
            // todo: extract the text view texture resource
        } // todo: check for other container types

        return null;
    }
}
