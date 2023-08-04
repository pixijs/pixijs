import { Matrix } from '../../maths/Matrix';
import { Point } from '../../maths/Point';
import { Filter } from '../../rendering/filters/shared/Filter';
import { GlProgram } from '../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../rendering/renderers/shared/shader/UniformGroup';
import fragment from './displacement.frag';
import vertex from './displacement.vert';
import source from './displacement.wgsl';

import type { FilterSystem } from '../../rendering/filters/shared/FilterSystem';
import type { Texture } from '../../rendering/renderers/shared/texture/Texture';
import type { Sprite } from '../../rendering/sprite/shared/Sprite';

export interface DisplacementFilterOptions
{
    sprite: Sprite,
    scale?: number | { x: number, y: number },
}

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof PIXI.filters
 * @author Vico @vicocotea
 */
export class DisplacementFilter extends Filter
{
    private readonly _sprite: Sprite;

    constructor(options: DisplacementFilterOptions)
    {
        let scale = options.scale ?? 20;

        // check if is a number or a point
        if (typeof scale === 'number')
        {
            scale = new Point(scale, scale);
        }

        const filterUniforms = new UniformGroup({
            filterMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            scale: { value: scale, type: 'vec2<f32>' },
            rotation: { value: new Float32Array([0, 0, 0, 0]), type: 'vec4<f32>' },
        });

        const glProgram = GlProgram.from({
            vertex,
            fragment,
            name: 'displacement-filter'
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

        const texture = options.sprite.texture;

        super({
            gpuProgram,
            glProgram,
            resources: {
                filterUniforms,
                mapTexture: texture.source,
                mapSampler: texture.style,
            }
        });

        this._sprite = options.sprite;
        this._sprite.renderable = false;
    }

    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: Texture,
        clearMode: boolean
    ): void
    {
        const uniforms = this.resources.filterUniforms.uniforms;

        filterManager.calculateSpriteMatrix(
            uniforms.filterMatrix,
            this._sprite
        );

        // Extract rotation from world transform
        const wt = this._sprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            uniforms.rotation[0] = wt.a / lenX;
            uniforms.rotation[1] = wt.b / lenX;
            uniforms.rotation[2] = wt.c / lenY;
            uniforms.rotation[3] = wt.d / lenY;
        }

        this.resources.mapTexture = this._sprite.texture.source;

        filterManager.applyFilter(this, input, output, clearMode);
    }

    get scale(): Point
    {
        return this.resources.filterUniforms.uniforms.scale as Point;
    }
}
