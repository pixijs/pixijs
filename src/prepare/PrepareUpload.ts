import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { GraphicsContext } from '../scene/graphics/shared/GraphicsContext';
import { Text } from '../scene/text/Text';
import { BitmapText } from '../scene/text-bitmap/BitmapText';
import { HTMLText } from '../scene/text-html/HTMLText';
import { PrepareQueue } from './PrepareQueue';

import type { FillInstruction, TextureInstruction } from '../scene/graphics/shared/GraphicsContext';
import type { PrepareQueueItem } from './PrepareBase';

/**
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class extends the resolver functionality and uploads the given queue items.
 * @memberof rendering
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
        else if (item instanceof Text)
        {
            this.uploadText(item);
        }
        else if (item instanceof HTMLText)
        {
            this.uploadHTMLText(item);
        }
        else if (item instanceof BitmapText)
        {
            this.uploadBitmapText(item);
        }
        else if (item instanceof GraphicsContext)
        {
            this.uploadGraphicsContext(item);
        }
    }

    protected uploadTextureSource(textureSource: TextureSource): void
    {
        this.renderer.texture.initSource(textureSource);
    }

    protected uploadText(_text: Text): void
    {
        this.renderer.renderPipes.text.initGpuText(_text);
    }

    protected uploadBitmapText(_text: BitmapText): void
    {
        this.renderer.renderPipes.bitmapText.initGpuText(_text);
    }

    protected uploadHTMLText(_text: HTMLText): void
    {
        this.renderer.renderPipes.htmlText.initGpuText(_text);
    }

    /**
     * Resolve the given graphics context and return an item for the queue
     * @param graphicsContext
     */
    protected uploadGraphicsContext(graphicsContext: GraphicsContext): void
    {
        this.renderer.graphicsContext.getContextRenderData(graphicsContext);

        const { instructions } = graphicsContext;

        for (const instruction of instructions)
        {
            if (instruction.action === 'texture')
            {
                const { image } = (instruction as TextureInstruction).data;

                this.uploadTextureSource(image.source);
            }
            else if (instruction.action === 'fill')
            {
                const { texture } = (instruction as FillInstruction).data.style;

                this.uploadTextureSource(texture.source);
            }
        }

        return null;
    }
}
