import { ALPHA_MODES } from '@pixi/constants';
import { Resource } from '@pixi/core';
import { determineCrossOrigin } from '@pixi/utils';
import { NodeCanvasElement } from './NodeCanvasElement';

import type { BaseTexture, GLTexture, Renderer } from '@pixi/core';

/**
 * A canvas resource using node-canvas
 * used for images, svg, and bitmap text
 * @memberof PIXI
 */
export class NodeCanvasResource extends Resource
{
    /**
     * The source element.
     * @member {NodeCanvasElement}
     * @readonly
     */
    public source: NodeCanvasElement;

    /**
     * If set to `true`, will force `texImage2D` over `texSubImage2D` for uploading.
     * Certain types of media (e.g. video) using `texImage2D` is more performant.
     * @default false
     * @private
     */
    public noSubImage: boolean;

    constructor(source: NodeCanvasElement)
    {
        const sourceAny = source as any;
        const width = sourceAny.naturalWidth || sourceAny.videoWidth || sourceAny.width;
        const height = sourceAny.naturalHeight || sourceAny.videoHeight || sourceAny.height;

        super(width, height);

        this.source = source;
        this.noSubImage = false;
    }

    override upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture, source?: HTMLCanvasElement): boolean
    {
        const gl = renderer.gl;
        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        source = (source || this.source) as HTMLCanvasElement;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);

        if (!this.noSubImage
             && baseTexture.target === gl.TEXTURE_2D
             && glTexture.width === width
             && glTexture.height === height)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, glTexture.type, source);
        }
        else
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, baseTexture.format, glTexture.type, source);
        }

        return true;
    }

    /**
     * Checks if source width/height was changed, resize can cause extra baseTexture update.
     * Triggers one update in any case.
     */
    update(): void
    {
        if (this.destroyed)
        {
            return;
        }

        const source = this.source as any;

        const width = source.naturalWidth || source.videoWidth || source.width;
        const height = source.naturalHeight || source.videoHeight || source.height;

        this.resize(width, height);

        super.update();
    }

    dispose(): void
    {
        this.source = null;
    }

    static override test(source: unknown): source is NodeCanvasElement
    {
        return source instanceof NodeCanvasElement;
    }

    /**
     * Set cross origin based detecting the url and the crossorigin
     * @param element - Element to apply crossOrigin
     * @param url - URL to check
     * @param crossorigin - Cross origin value to use
     */
    static crossOrigin(element: HTMLImageElement | HTMLVideoElement, url: string, crossorigin?: boolean | string): void
    {
        if (crossorigin === undefined && url.indexOf('data:') !== 0)
        {
            element.crossOrigin = determineCrossOrigin(url);
        }
        else if (crossorigin !== false)
        {
            element.crossOrigin = typeof crossorigin === 'string' ? crossorigin : 'anonymous';
        }
    }
}
