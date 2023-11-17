import { GlProgram } from '../../../rendering/renderers/gl/shader/GlProgram';
import { GpuProgram } from '../../../rendering/renderers/gpu/shader/GpuProgram';
import { UniformGroup } from '../../../rendering/renderers/shared/shader/UniformGroup';
import { Filter } from '../../Filter';
import fragment from './shockwave.frag';
import vertex from './shockwave.vert';
import source from './shockwave.wgsl';

import type { PointData } from '../../../maths/point/PointData';
import type { RenderSurface } from '../../../rendering/renderers/shared/renderTarget/RenderTargetSystem';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { FilterOptions } from '../../Filter';
import type { FilterSystem } from '../../FilterSystem';

/**
 * Options for ShockwaveFilter
 * @memberof filters
 */
export interface ShockwaveFilterOptions
{
    /**
     * The `x` and `y` center coordinates to change the position of the center of the circle of effect.
     * @default [0,0]
     */
    center?: PointData;
    /**
     * The speed about the shockwave ripples out. The unit is `pixel-per-second`
     * @default 500
     */
    speed?: number;
    /**
     * The amplitude of the shockwave
     * @default 30
     */
    amplitude?: number;
    /**
     * The wavelength of the shockwave
     * @default 160
     */
    wavelength?: number;
    /**
     * The brightness of the shockwave
     * @default 1
     */
    brightness?: number;
    /**
     * The maximum radius of shockwave. less than `0` means the max is an infinite distance
     * @default -1
     */
    radius?: number;
}

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 * @memberof filters
 * @author Vico @vicocotea
 */
export class ShockwaveFilter extends Filter
{
    /** Default shockwave filter options */
    public static readonly defaultOptions: ShockwaveFilterOptions & Partial<FilterOptions> = {
        ...Filter.defaultOptions,
        /** The `x` and `y` center coordinates to change the position of the center of the circle of effect. */
        center: { x: 0, y: 0 },
        /** The speed about the shockwave ripples out. The unit is `pixel-per-second` */
        speed: 500,
        /** The amplitude of the shockwave */
        amplitude: 30,
        /** The wavelength of the shockwave */
        wavelength: 160,
        /** The brightness of the shockwave */
        brightness: 1,
        /** The maximum radius of shockwave. less than `0` means the max is an infinite distance */
        radius: -1,
    };

    public uniforms: {
        uTime: number;
        uCenter: PointData;
        uSpeed: number;
        uWave: Float32Array;
    };

    /** Sets the elapsed time of the shockwave. It could control the current size of shockwave. */
    public time: number;

    /**
     * @param options
     */
    constructor(options: ShockwaveFilterOptions = {})
    {
        options = { ...ShockwaveFilter.defaultOptions, ...options };

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

        const glProgram = new GlProgram({
            vertex,
            fragment,
            name: 'shockwave-filter'
        });

        super({
            gpuProgram,
            glProgram,
            resources: {
                shockwaveUniforms: new UniformGroup({
                    uTime: { value: 0, type: 'f32' },
                    uCenter: { value: options.center, type: 'vec2<f32>' },
                    uSpeed: { value: options.speed, type: 'f32' },
                    uWave: { value: new Float32Array(4), type: 'vec4<f32>' },
                })
            },
            resolution: 1,
        });

        this.time = 0;

        this.uniforms = this.resources.shockwaveUniforms.uniforms;

        Object.assign(this, options);
    }

    public override apply(
        filterManager: FilterSystem,
        input: Texture,
        output: RenderSurface,
        clearMode: boolean
    ): void
    {
        // There is no set/get of `time`, for performance.
        // Because in the most real cases, `time` will be changed in ever game tick.
        // Use set/get will take more function-call.
        this.uniforms.uTime = this.time;
        filterManager.applyFilter(this, input, output, clearMode);
    }

    /**
     * The `x` and `y` center coordinates to change the position of the center of the circle of effect.
     * @default [0,0]
     */
    get center(): PointData { return this.uniforms.uCenter; }
    set center(value: PointData) { this.uniforms.uCenter = value; }

    /**
     * Sets the center of the effect in normalized screen coords on the `x` axis
     * @default 0
     */
    get centerX(): number { return this.uniforms.uCenter.x; }
    set centerX(value: number) { this.uniforms.uCenter.x = value; }

    /**
     * Sets the center of the effect in normalized screen coords on the `y` axis
     * @default 0
     */
    get centerY(): number { return this.uniforms.uCenter.y; }
    set centerY(value: number) { this.uniforms.uCenter.y = value; }

    /**
     * The speed about the shockwave ripples out. The unit is `pixel-per-second`
     * @default 500
     */
    get speed(): number { return this.uniforms.uSpeed; }
    set speed(value: number) { this.uniforms.uSpeed = value; }

    /**
     * The amplitude of the shockwave
     * @default 30
     */
    get amplitude(): number { return this.uniforms.uWave[0]; }
    set amplitude(value: number) { this.uniforms.uWave[0] = value; }

    /**
     * The wavelength of the shockwave
     * @default 160
     */
    get wavelength(): number { return this.uniforms.uWave[1]; }
    set wavelength(value: number) { this.uniforms.uWave[1] = value; }

    /**
     * The brightness of the shockwave
     * @default 1
     */
    get brightness(): number { return this.uniforms.uWave[2]; }
    set brightness(value: number) { this.uniforms.uWave[2] = value; }

    /**
     * The maximum radius of shockwave. less than `0` means the max is an infinite distance
     * @default -1
     */
    get radius(): number { return this.uniforms.uWave[3]; }
    set radius(value: number) { this.uniforms.uWave[3] = value; }
}
