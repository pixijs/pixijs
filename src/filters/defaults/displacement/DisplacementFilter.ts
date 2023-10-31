import { Matrix } from '../../../maths/matrix/Matrix';
import { Point } from '../../../maths/point/Point';
import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Sprite } from '../../../scene/sprite/Sprite';
import { deprecation, v8_0_0 } from '../../../utils/logging/deprecation';
import { Filter } from '../../Filter';
import fragment from './displacement.frag';
import vertex from './displacement.vert';
import source from './displacement.wgsl';

import type { PointData } from '../../../maths/point/PointData';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { FilterSystem } from '../../FilterSystem';

/**
 * Options for DisplacementFilter
 * @memberof filters
 */
export interface DisplacementFilterOptions
{
    /** The texture used for the displacement map. */
    sprite: Sprite,
    /** The scale of the displacement. */
    scale?: number | PointData,
}

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof filters
 * @author Vico @vicocotea
 */
export class DisplacementFilter extends Filter
{
    private readonly _sprite: Sprite;

    constructor(options: Sprite | DisplacementFilterOptions);
    /** @deprecated since 8.0.0 */
    constructor(sprite: Sprite, scale?: number | PointData);
    constructor(...args: [Sprite | DisplacementFilterOptions] | [Sprite, (number | PointData)?])
    {
        let options = args[0];

        if (options instanceof Sprite)
        {
            if (args[1])
            {
                deprecation(v8_0_0, 'DisplacementFilter now uses options object instead of params. {sprite, scale}');
            }

            options = { sprite: options, scale: args[1] };
        }

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

        const textureSource = options.sprite.texture.source;

        super({
            gpuProgram,
            glProgram,
            resources: {
                filterUniforms,
                mapTexture: textureSource,
                mapSampler: textureSource.style,
            }
        });

        this._sprite = options.sprite;
        this._sprite.renderable = false;
    }

    /**
     * Applies the filter.
     * @param filterManager - The manager.
     * @param input - The input target.
     * @param output - The output target.
     * @param clearMode - clearMode.
     */
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

    /** scaleX, scaleY for displacements */
    get scale(): Point
    {
        return this.resources.filterUniforms.uniforms.scale as Point;
    }
}
