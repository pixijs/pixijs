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
import type { FilterOptions } from '../../Filter';
import type { FilterSystem } from '../../FilterSystem';

/**
 * Configuration options for the DisplacementFilter.
 *
 * A displacement filter uses a sprite's texture as a displacement map,
 * moving pixels of the target based on the color values of corresponding
 * pixels in the displacement sprite.
 * @example
 * ```ts
 * const options: DisplacementFilterOptions = {
 *     sprite: displacementSprite,
 *     scale: { x: 20, y: 20 }
 * };
 *
 * const filter = new DisplacementFilter(options);
 * ```
 * @category filters
 * @standard
 */
export interface DisplacementFilterOptions extends FilterOptions
{
    /**
     * The sprite whose texture will be used as the displacement map.
     * Red channel = horizontal displacement
     * Green channel = vertical displacement
     * @example
     * ```ts
     * const displacementSprite = new Sprite(texture);
     * const filter = new DisplacementFilter({ sprite: displacementSprite });
     * ```
     */
    sprite: Sprite;

    /**
     * The scale of the displacement effect. Can be a single number for uniform
     * scaling or a point-like object for separate x/y scaling.
     * @default 20
     * @example
     * ```ts
     * // Uniform scaling
     * new DisplacementFilter({ sprite, scale: 20 });
     * // Separate scaling
     * new DisplacementFilter({ sprite, scale: { x: 10, y: 15 } });
     * ```
     */
    scale?: number | PointData;
}

/**
 * A filter that applies a displacement map effect using a sprite's texture.
 *
 * The DisplacementFilter uses another texture (from a sprite) as a displacement map,
 * where the red and green channels of each pixel in the map determine how the corresponding
 * pixel in the filtered object should be offset:
 * - Red channel controls horizontal displacement
 * - Green channel controls vertical displacement
 *
 * Common use cases:
 * - Creating ripple or wave effects
 * - Distorting images dynamically
 * - Implementing heat haze effects
 * - Creating transition effects
 * @example
 * ```ts
 * import { Sprite, DisplacementFilter } from 'pixi.js';
 *
 * // Create a sprite to use as the displacement map
 * const displacementSprite = Sprite.from('displacement-map.png');
 *
 * // Create and configure the filter
 * const displacementFilter = new DisplacementFilter({
 *     sprite: displacementSprite,
 *     scale: { x: 20, y: 20 }
 * });
 *
 * // Apply to any display object
 * container.filters = [displacementFilter];
 * ```
 * @category filters
 * @author Vico: vicocotea
 * @standard
 * @noInheritDoc
 */
export class DisplacementFilter extends Filter
{
    private readonly _sprite: Sprite;

    /**
     * @param {Sprite | DisplacementFilterOptions} options - The sprite or options object.
     * @param {Sprite} options.sprite - The texture used for the displacement map.
     * @param {number | PointData} options.scale - The scale of the displacement.
     */
    constructor(options: Sprite | DisplacementFilterOptions);
    /** @deprecated since 8.0.0 */
    constructor(sprite: Sprite, scale?: number | PointData);
    constructor(...args: [Sprite | DisplacementFilterOptions] | [Sprite, (number | PointData)?])
    {
        let options = args[0];

        if (options instanceof Sprite)
        {
            // #if _DEBUG
            if (args[1])
            {
                deprecation(v8_0_0, 'DisplacementFilter now uses options object instead of params. {sprite, scale}');
            }
            // #endif

            options = { sprite: options, scale: args[1] };
        }

        const { sprite, scale: scaleOption, ...rest } = options;

        let scale = scaleOption ?? 20;

        // check if is a number or a point
        if (typeof scale === 'number')
        {
            scale = new Point(scale, scale);
        }

        const filterUniforms = new UniformGroup({
            uFilterMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
            uScale: { value: scale, type: 'vec2<f32>' },
            uRotation: { value: new Float32Array([0, 0, 0, 0]), type: 'mat2x2<f32>' },
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

        const textureSource = sprite.texture.source;

        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                filterUniforms,
                uMapTexture: textureSource,
                uMapSampler: textureSource.style,
            },
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
     * @advanced
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
            uniforms.uFilterMatrix,
            this._sprite
        );

        // Extract rotation from world transform
        const wt = this._sprite.worldTransform;
        const lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        const lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            uniforms.uRotation[0] = wt.a / lenX;
            uniforms.uRotation[1] = wt.b / lenX;
            uniforms.uRotation[2] = wt.c / lenY;
            uniforms.uRotation[3] = wt.d / lenY;
        }

        this.resources.uMapTexture = this._sprite.texture.source;

        filterManager.applyFilter(this, input, output, clearMode);
    }

    /**
     * The scale of the displacement effect.
     *
     * Gets the current x and y scaling values used for the displacement mapping.
     * - x: Horizontal displacement scale
     * - y: Vertical displacement scale
     * @returns {Point} The current scale as a Point object
     * @example
     * ```ts
     * const filter = new DisplacementFilter({ sprite });
     *
     * // Get current scale
     * console.log(filter.scale.x, filter.scale.y);
     *
     * // Update scale
     * filter.scale.x = 100;
     * filter.scale.y = 50;
     * ```
     */
    get scale(): Point
    {
        return this.resources.filterUniforms.uniforms.uScale as Point;
    }
}
