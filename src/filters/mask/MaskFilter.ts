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

export interface MaskFilterOptions extends FilterOptions
{
    sprite: Sprite,
    inverse?: boolean;
    scale?: number | { x: number, y: number },
}

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
