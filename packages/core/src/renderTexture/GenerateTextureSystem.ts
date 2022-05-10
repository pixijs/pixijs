import { MSAA_QUALITY, SCALE_MODES } from '@pixi/constants';
import { Matrix, Rectangle } from '@pixi/math';
import { deprecation } from '@pixi/utils';
import { IRenderer, IRenderableContainer, IRenderableObject } from '../IRenderer';
import { ISystem } from '../system/ISystem';
import { RenderTexture } from './RenderTexture';

// TODO could this just be part of extract?
export interface IGenerateTextureOptions {
    scaleMode?: SCALE_MODES;
    resolution?: number;
    region?: Rectangle;
    multisample?: MSAA_QUALITY;
}

export class GenerateTextureSystem implements ISystem
{
    renderer: IRenderer;
    tempMatrix: Matrix;

    constructor(renderer: IRenderer)
    {
        this.renderer = renderer;

        this.tempMatrix = new Matrix();
    }

    generateTexture(displayObject: IRenderableObject,
        options: IGenerateTextureOptions | SCALE_MODES = {},
        resolution?: number, region?: Rectangle): RenderTexture
    {
        // @deprecated parameters spread, use options instead
        if (typeof options === 'number')
        {
            // #if _DEBUG
            deprecation('6.1.0', 'generateTexture options (scaleMode, resolution, region) are now object options.');
            // #endif

            options = { scaleMode: options, resolution, region };
        }

        const { region: manualRegion, ...textureOptions } = options;

        region = manualRegion || (displayObject as IRenderableContainer).getLocalBounds(null, true);

        // minimum texture size is 1x1, 0x0 will throw an error
        if (region.width === 0) region.width = 1;
        if (region.height === 0) region.height = 1;

        const renderTexture = RenderTexture.create(
            {
                width: region.width,
                height: region.height,
                ...textureOptions,
            });

        this.tempMatrix.tx = -region.x;
        this.tempMatrix.ty = -region.y;

        this.renderer.render(displayObject, {
            renderTexture,
            clear: false,
            transform:  this.tempMatrix,
            skipUpdateTransform: !!displayObject.parent
        });

        return renderTexture;
    }

    destroy(): void
    {
        // ka boom!
        this.renderer = null;
        this.tempMatrix = null;
    }
}
