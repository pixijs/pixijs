import { MSAA_QUALITY, SCALE_MODES } from '@pixi/constants';
import { Matrix, Rectangle } from '@pixi/math';
import { IRenderer, IRenderableContainer, IRenderableObject } from '../IRenderer';
import { ISystem } from '../system/ISystem';
import { RenderTexture } from './RenderTexture';

// TODO could this just be part of extract?
export interface IGenerateTextureOptions {
    /**
     * The scale mode of the texture. Optional, defaults to `PIXI.settings.SCALE_MODE`.
     */
    scaleMode?: SCALE_MODES;
    /**
     * The resolution / device pixel ratio of the texture being generated. Optional defaults to Renderer resolution.
     */
    resolution?: number;
    /**
     * The region of the displayObject, that shall be rendered,
     * if no region is specified, defaults to the local bounds of the displayObject.
     */
    region?: Rectangle;
    /**
     *  The number of samples of the frame buffer.
     */
    multisample?: MSAA_QUALITY;
}

/**
 * System that manages the generation of textures from the renderer.
 *
 * @memberof PIXI
 */
export class GenerateTextureSystem implements ISystem
{
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
     *
     * @param displayObject The displayObject the object will be generated from.
     * @param {IGenerateTextureOptions} options - Generate texture options.
     * @returns a shiny new texture of the display object passed in
     */
    generateTexture(displayObject: IRenderableObject, options: IGenerateTextureOptions): RenderTexture
    {
        const { region: manualRegion, ...textureOptions } = options;

        const region = manualRegion || (displayObject as IRenderableContainer).getLocalBounds(null, true);

        // minimum texture size is 1x1, 0x0 will throw an error
        if (region.width === 0) region.width = 1;
        if (region.height === 0) region.height = 1;

        const renderTexture = RenderTexture.create(
            {
                width: region.width,
                height: region.height,
                ...textureOptions,
            });

        this._tempMatrix.tx = -region.x;
        this._tempMatrix.ty = -region.y;

        this.renderer.render(displayObject, {
            renderTexture,
            clear: false,
            transform:  this._tempMatrix,
            skipUpdateTransform: !!displayObject.parent
        });

        return renderTexture;
    }

    destroy(): void
    {
        // ka boom!
        this.renderer = null;
        this._tempMatrix = null;
    }
}
