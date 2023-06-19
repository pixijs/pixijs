import { extensions, ExtensionType } from '@pixi/extensions';
import { Matrix, Rectangle, Transform } from '@pixi/math';
import { RenderTexture } from './RenderTexture';

import type { MSAA_QUALITY } from '@pixi/constants';
import type { ExtensionMetadata } from '@pixi/extensions';
import type { IRenderableContainer, IRenderableObject, IRenderer } from '../IRenderer';
import type { ISystem } from '../system/ISystem';
import type { IBaseTextureOptions } from '../textures/BaseTexture';

const tempTransform = new Transform();
const tempRect = new Rectangle();

// TODO could this just be part of extract?
export interface IGenerateTextureOptions extends IBaseTextureOptions
{
    /**
     * The region of the displayObject, that shall be rendered,
     * if no region is specified, defaults to the local bounds of the displayObject.
     */
    region?: Rectangle;
    /** The resolution / device pixel ratio of the texture being generated. The default is the renderer's resolution. */
    resolution?: number;
    /** The number of samples of the frame buffer. The default is the renderer's multisample. */
    multisample?: MSAA_QUALITY;
}

/**
 * System that manages the generation of textures from the renderer.
 * @memberof PIXI
 */
export class GenerateTextureSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.RendererSystem,
            ExtensionType.CanvasRendererSystem
        ],
        name: 'textureGenerator',
    };

    renderer: IRenderer;

    private readonly _tempMatrix: Matrix;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;

        this._tempMatrix = new Matrix();
    }

    /**
     * A Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     * @param displayObject - The displayObject the object will be generated from.
     * @param {IGenerateTextureOptions} options - Generate texture options.
     * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @param {number} [options.resolution] - If not given, the renderer's resolution is used.
     * @param {PIXI.MSAA_QUALITY} [options.multisample] - If not given, the renderer's multisample is used.
     * @returns a shiny new texture of the display object passed in
     */
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): RenderTexture
    {
        const { region: manualRegion, ...textureOptions } = options || {};

        const region = manualRegion?.copyTo(tempRect)
            || (displayObject as IRenderableContainer).getLocalBounds(tempRect, true);
        const resolution = textureOptions.resolution || this.renderer.resolution;

        region.width = Math.max(region.width, 1 / resolution);
        region.height = Math.max(region.height, 1 / resolution);

        textureOptions.width = region.width;
        textureOptions.height = region.height;
        textureOptions.resolution = resolution;
        textureOptions.multisample ??= this.renderer.multisample;

        const renderTexture = RenderTexture.create(textureOptions);

        this._tempMatrix.tx = -region.x;
        this._tempMatrix.ty = -region.y;

        const transform = displayObject.transform;

        displayObject.transform = tempTransform;

        this.renderer.render(displayObject, {
            renderTexture,
            transform: this._tempMatrix,
            skipUpdateTransform: !!displayObject.parent,
            blit: true,
        });

        displayObject.transform = transform;

        return renderTexture;
    }

    destroy(): void
    {
        // ka boom!
    }
}

extensions.add(GenerateTextureSystem);
