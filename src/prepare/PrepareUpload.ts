import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { TextView } from '../scene/text/TextView';
import { PrepareQueue } from './PrepareQueue';

import type { PrepareQueueItem } from './PrepareBase';

/**
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class extends the resolver functionality and uploads the given queue items.
 */
export abstract class PrepareUpload extends PrepareQueue
{
    /**
     * Upload the given queue item
     * @param item
     */
    protected uploadQueueItem(item: PrepareQueueItem): void
    {
        if (item instanceof TextureSource)
        {
            this.uploadTextureSource(item);
        }
        else if (item instanceof TextView)
        {
            this.uploadText(item);
        }
    }

    protected uploadTextureSource(textureSource: TextureSource): void
    {
        this.renderer.texture.initSource(textureSource);
    }

    protected uploadText(_text: TextView): void
    {
        // todo: upload the text view resource
    }
}
