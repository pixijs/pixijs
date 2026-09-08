import { ExtensionType } from '../../../../extensions/Extensions';
import { State } from '../../shared/state/State';
import { GpuBlendModesToPixi } from './GpuBlendModesToPixi';

import type { BLEND_MODES } from '../../shared/state/const';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';

/**
 * System plugin to the renderer to manage WebGL state machines.
 * @category rendering
 * @advanced
 */
export class GpuStateSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'state',
    } as const;
    /**
     * State ID
     * @readonly
     */
    public stateId: number;

    /**
     * Polygon offset
     * @readonly
     */
    public polygonOffset: number;

    /**
     * Blend mode
     * @default 'none'
     * @readonly
     */
    public blendMode: BLEND_MODES;

    /** Whether current blend equation is different */
    protected _blendEq: boolean;

    /**
     * GL context
     * @type {WebGLRenderingContext}
     * @readonly
     */
    protected gpu: GPU;

    /**
     * Default WebGL State
     * @readonly
     */
    protected defaultState: State;

    constructor()
    {
        this.defaultState = new State();
        this.defaultState.blend = true;
    }

    protected contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    /**
     * Gets the blend mode data for the current state
     * @param state - The state to get the blend mode from
     * @param count - The number of color targets to create
     * @param format - The texture format of the color attachments (assumed uniform across attachments)
     */
    public getColorTargets(state: State, count: number, format: GPUTextureFormat): GPUColorTargetState[]
    {
        // WebGPU blending is enabled/disabled by the presence of `GPUColorTargetState.blend`.
        // A boolean flag alone doesn't exist at the API level.
        // If `state.blend` is false (e.g. filters doing multiple passes) we must omit the blend descriptor entirely.
        const blend = (state.blend)
            ? (GpuBlendModesToPixi[state.blendMode] || GpuBlendModesToPixi.normal)
            : undefined;

        const targets: GPUColorTargetState[] = [];

        // Emit one fresh object per attachment so the caller can mutate per-target fields
        // (e.g. writeMask) without aliasing across slots.
        for (let i = 0; i < count; i++)
        {
            targets[i] = {
                format,
                writeMask: 0,
                blend,
            };
        }

        return targets;
    }

    public destroy(): void
    {
        this.gpu = null;
    }
}
