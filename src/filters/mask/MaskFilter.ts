import { Matrix } from '../../maths/matrix/Matrix';
import { GlProgram } from '../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import { TextureMatrix } from '../../rendering/renderers/shared/texture/TextureMatrix';
import { Filter } from '../Filter';
import fragment from './mask.frag';
import vertex from './mask.vert';
import source from './mask.wgsl';

import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { Sprite } from '../../scene/sprite/Sprite';
import type { FilterOptions } from '../Filter';
import type { FilterSystem } from '../FilterSystem';

/**
 * The channel to use for masking.
 * - `'red'` - Uses the red channel of the mask texture (default). Suitable for grayscale mask textures.
 * - `'alpha'` - Uses the alpha channel of the mask texture. Suitable for sprites with transparency.
 * @category rendering
 * @standard
 */
export type MaskChannel = 'red' | 'alpha';

/** @internal */
export interface MaskFilterOptions extends FilterOptions
{
    sprite: Sprite,
    inverse?: boolean;
    channel?: MaskChannel;
    scale?: number | { x: number, y: number },
}

/** @internal */
export class MaskFilter extends Filter
{
    public sprite: Sprite;
    private readonly _textureMatrix: TextureMatrix;

    constructor(options: MaskFilterOptions)
    {
        const { sprite, ...rest } = options;

        const textureMatrix = new TextureMatrix(sprite.texture);

        const filterUniforms = new UniformGroup({
            uFilterMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uMaskClamp: { value: textureMatrix.uClampFrame, type: 'vec4<f32>' },
            uAlpha: { value: 1, type: 'f32' },
            uInverse: { value: options.inverse ? 1 : 0, type: 'f32' },
            uChannel: { value: options.channel === 'alpha' ? 1 : 0, type: 'f32' },
        });

        const gpuProgram = GpuProgram.from({
            vertex: {
                source,
                entryPoint: 'mainVertex',
            },
            fragment: {
                source,
                entryPoint: 'mainFragment',
            },
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'mask-filter',
        });

        super({
            ...rest,
            gpuProgram,
            glProgram,
            clipToViewport: false,
            resources: {
                filterUniforms,
                uMaskTexture: sprite.texture.source,
            },
        });

        this.sprite = sprite;

        this._textureMatrix = textureMatrix;
    }

    set inverse(value: boolean)
    {
        this.resources.filterUniforms.uniforms.uInverse = value ? 1 : 0;
    }

    get inverse(): boolean
    {
        return this.resources.filterUniforms.uniforms.uInverse === 1;
    }

    set channel(value: MaskChannel)
    {
        this.resources.filterUniforms.uniforms.uChannel = value === 'alpha' ? 1 : 0;
    }

    get channel(): MaskChannel
    {
        return this.resources.filterUniforms.uniforms.uChannel === 1 ? 'alpha' : 'red';
    }

    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: Texture,
        clearMode: boolean
    ): void
    {
        // will trigger an update if the texture changed..
        this._textureMatrix.texture = this.sprite.texture;

        filterManager.calculateSpriteMatrix(
            this.resources.filterUniforms.uniforms.uFilterMatrix as Matrix,
            this.sprite
        ).prepend(this._textureMatrix.mapCoord);

        this.resources.uMaskTexture = this.sprite.texture.source;

        filterManager.applyFilter(this, input, output, clearMode);
    }
}
