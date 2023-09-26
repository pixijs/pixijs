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
import type { FilterSystem } from '../FilterSystem';

export interface MaskFilterOptions
{
    sprite: Sprite,
    scale?: number | { x: number, y: number },
}

export class MaskFilter extends Filter
{
    public sprite: Sprite;
    private readonly _textureMatrix: TextureMatrix;

    constructor({ sprite }: MaskFilterOptions)
    {
        const textureMatrix = new TextureMatrix(sprite.texture);

        const filterUniforms = new UniformGroup({
            filterMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            maskClamp: { value: textureMatrix.uClampFrame, type: 'vec4<f32>' },
            alpha: { value: 1, type: 'f32' },
        });

        const gpuProgram = new GpuProgram({
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
            gpuProgram,
            glProgram,
            resources: {
                filterUniforms,
                mapTexture: sprite.texture.source,
            }
        });

        this.sprite = sprite;

        this._textureMatrix = textureMatrix;
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
            this.resources.filterUniforms.uniforms.filterMatrix as Matrix,
            this.sprite
        ).prepend(this._textureMatrix.mapCoord);

        this.resources.mapTexture = this.sprite.texture.source;

        filterManager.applyFilter(this, input, output, clearMode);
    }
}
