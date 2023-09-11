import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { Matrix } from '../../../maths/Matrix';
import { Rectangle } from '../../../maths/shapes/Rectangle';
import { Bounds } from '../../scene/bounds/Bounds';
import { getLocalBounds } from '../../scene/bounds/getLocalBounds';
import { Container } from '../../scene/Container';
import { RenderTexture } from './texture/RenderTexture';

import type { Renderer } from '../types';
import type { System } from './system/System';
import type { TextureSourceOptions } from './texture/sources/TextureSource';
import type { Texture } from './texture/Texture';

// legacy support for v7
export interface IGenerateTextureOptions
{
/**
 * The region of the displayObject, that shall be rendered,
 * if no region is specified, defaults to the local bounds of the displayObject.
 */
    region?: Rectangle;
    // un-supported
    resolution?: number;
    multisample?: number;
    // from legacy IBaseTextureOptions
    alphaMode?: number;
    mipmap?: number;
    anisotropicLevel?: number;
    scaleMode?: number;
    width?: number;
    height?: number;
    wrapMode?: number;
    format?: number;
    type?: number;
    target?: number;
    resourceOptions?: any;
    pixiIdPrefix?: string;
}

export type GenerateTextureSourceOptions = Omit<TextureSourceOptions, 'resource' | 'width' | 'height' | 'resolution'>;

export type GenerateTextureOptions =
{
    /** The container to generate the texture from */
    container: Container;
    /**
     * The region of the displayObject, that shall be rendered,
     * if no region is specified, defaults to the local bounds of the displayObject.
     */
    region?: Rectangle;

    resolution?: number;

    /** The options passed to the texture source. */
    textureSourceOptions?: GenerateTextureSourceOptions
};

// const tempTransform = new Transform();
const tempRect = new Rectangle();
const tempBounds = new Bounds();

/**
 * System that manages the generation of textures from the renderer.
 * @memberof PIXI
 */
export class GenerateTextureSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'textureGenerator',
    } as const;

    private readonly _renderer: Renderer;

    constructor(renderer: Renderer)
    {
        this._renderer = renderer;
    }

    /**
     * A Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     * @param {GenerateTextureOptions | Container} options - Generate texture options.
     * @param {Container} [options.container] - If not given, the renderer's resolution is used.
     * @param {PIXI.Rectangle} options.region - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @param {GenerateTextureSourceOptions} [options.textureSourceOptions] - Texture options for GPU.
     * @returns a shiny new texture of the container passed in
     */
    public generateTexture(options: GenerateTextureOptions | Container): Texture
    {
        if (options instanceof Container)
        {
            options = {
                container: options,
                region: undefined,
                textureSourceOptions: {},
                resolution: undefined,
            };
        }

        const resolution = options.resolution || this._renderer.resolution;
        const container = options.container;

        const region = options.region?.copyTo(tempRect)
            || getLocalBounds(container, tempBounds).rectangle;

        region.width = Math.max(region.width, 1 / resolution) | 0;
        region.height = Math.max(region.height, 1 / resolution) | 0;

        const target = RenderTexture.create({
            ...options.textureSourceOptions,
            width: region.width,
            height: region.height,
            resolution,
        });

        const transform = Matrix.shared.translate(-region.x, -region.y);

        this._renderer.render({
            container,
            transform,
            target,
        });

        return target;
    }

    public destroy(): void
    {
        // ka boom!
    }
}

extensions.add(GenerateTextureSystem);
