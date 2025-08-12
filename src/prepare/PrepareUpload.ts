import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';
import { GraphicsContext } from '../scene/graphics/shared/GraphicsContext';
import { Text } from '../scene/text/Text';
import { BitmapText } from '../scene/text-bitmap/BitmapText';
import { HTMLText } from '../scene/text-html/HTMLText';
import { PrepareQueue } from './PrepareQueue';

import type { FillInstruction, TextureInstruction } from '../scene/graphics/shared/GraphicsContext';
import type { PrepareQueueItem } from './PrepareBase';

const typeSymbol = Symbol.for('pixijs.PrepareUpload');

/**
 * @advanced
 * Part of the prepare system. Responsible for uploading all the items to the GPU.
 * This class extends the resolver functionality and uploads the given queue items.
 * @category rendering
 */
export abstract class PrepareUpload extends PrepareQueue
{
    /**
     * Type symbol used to identify instances of PrepareUpload.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a PrepareUpload.
     * @param obj - The object to check.
     * @returns True if the object is a PrepareUpload, false otherwise.
     */
    public static isPrepareUpload(obj: any): obj is PrepareUpload
    {
        return !!obj && !!obj[typeSymbol];
    }

    /**
     * Upload the given queue item
     * @param item
     */
    protected uploadQueueItem(item: PrepareQueueItem): void
    {
        if (TextureSource.isTextureSource(item))
        {
            this.uploadTextureSource(item);
        }
        else if (Text.isText(item))
        {
            this.uploadText(item);
        }
        else if (HTMLText.isHTMLText(item))
        {
            this.uploadHTMLText(item);
        }
        else if (BitmapText.isBitmapText(item))
        {
            this.uploadBitmapText(item);
        }
        else if (GraphicsContext.isGraphicsContext(item))
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
        this.renderer.graphicsContext.getGpuContext(graphicsContext);

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
