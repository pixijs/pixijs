// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type { BaseTexture, GLTexture, Renderer } from 'pixi.js';
import { ALPHA_MODES, BaseImageResource } from 'pixi.js';

import { NodeCanvasElement } from './NodeCanvasElement';

export class NodeCanvasResource extends BaseImageResource
{
    /**
     * @param source - Canvas element to use
     */
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(source: NodeCanvasElement)
    {
        super(source);
    }

    static override test(source: unknown): source is NodeCanvasElement
    {
        return source instanceof NodeCanvasElement;
    }

    override upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture, source?: NodeCanvasElement): boolean
    {
        const gl = renderer.gl;
        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        source = source || this.source;

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
}
