import { Color, type ColorSource } from '../../../../color/Color';
import { ExtensionType } from '../../../../extensions/Extensions';
import { Matrix } from '../../../../maths/matrix/Matrix';
import { Rectangle } from '../../../../maths/shapes/Rectangle';
import { Bounds } from '../../../../scene/container/bounds/Bounds';
import { getLocalBounds } from '../../../../scene/container/bounds/getLocalBounds';
import { Container } from '../../../../scene/container/Container';
import { RenderTexture } from '../texture/RenderTexture';

import type { Renderer } from '../../types';
import type { System } from '../system/System';
import type { TextureSourceOptions } from '../texture/sources/TextureSource';
import type { Texture } from '../texture/Texture';

export type GenerateTextureSourceOptions = Omit<TextureSourceOptions, 'resource' | 'width' | 'height' | 'resolution'>;

/**
 * Options for generating a texture from a container.
 * @memberof rendering
 */
export type GenerateTextureOptions =
{
    /** The container to generate the texture from */
    target: Container;
    /**
     * The region of the container, that shall be rendered,
     * if no region is specified, defaults to the local bounds of the container.
     */
    frame?: Rectangle;
    /** The resolution of the texture being generated. */
    resolution?: number;
    /** The color used to clear the texture. */
    clearColor?: ColorSource;
    /** Whether to enable anti-aliasing. This may affect performance. */
    antialias?: boolean;
    /** The options passed to the texture source. */
    textureSourceOptions?: GenerateTextureSourceOptions,
};

const tempRect = new Rectangle();
const tempBounds = new Bounds();
const noColor: ColorSource = [0, 0, 0, 0];

/**
 * System that manages the generation of textures from the renderer
 *
 *
 * Do not instantiate these plugins directly. It is available from the `renderer.textureGenerator` property.
 * @memberof rendering
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
     * This can be quite useful if your container is complicated and needs to be reused multiple times.
     * @param {GenerateTextureOptions | Container} options - Generate texture options.
     * @param {Container} [options.container] - If not given, the renderer's resolution is used.
     * @param {Rectangle} options.region - The region of the container, that shall be rendered,
     * @param {number} [options.resolution] - The resolution of the texture being generated.
     *        if no region is specified, defaults to the local bounds of the container.
     * @param {GenerateTextureSourceOptions} [options.textureSourceOptions] - Texture options for GPU.
     * @returns a shiny new texture of the container passed in
     */
    public generateTexture(options: GenerateTextureOptions | Container): Texture
    {
        if (options instanceof Container)
        {
            options = {
                target: options,
                frame: undefined,
                textureSourceOptions: {},
                resolution: undefined,
            };
        }

        const resolution = options.resolution || this._renderer.resolution;
        const antialias = options.antialias || this._renderer.view.antialias;

        const container = options.target;

        let clearColor = options.clearColor;

        if (clearColor)
        {
            const isRGBAArray = Array.isArray(clearColor) && clearColor.length === 4;

            clearColor = isRGBAArray ? clearColor : Color.shared.setValue(clearColor).toArray();
        }
        else
        {
            clearColor = noColor;
        }

        const region = options.frame?.copyTo(tempRect)
            || getLocalBounds(container, tempBounds).rectangle;

        region.width = Math.max(region.width, 1 / resolution) | 0;
        region.height = Math.max(region.height, 1 / resolution) | 0;

        const target = RenderTexture.create({
            ...options.textureSourceOptions,
            width: region.width,
            height: region.height,
            resolution,
            antialias,
        });

        const transform = Matrix.shared.translate(-region.x, -region.y);

        this._renderer.render({
            container,
            transform,
            target,
            clearColor,
        });

        target.source.updateMipmaps();

        return target;
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
    }
}
