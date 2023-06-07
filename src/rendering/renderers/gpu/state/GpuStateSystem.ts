import { ExtensionType } from '../../../../extensions/Extensions';
import { State } from '../../shared/state/State';
import { GpuBlendModesToPixi } from './GpuBlendModesToPixi';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { BLEND_MODES } from '../../shared/state/const';
import type { ISystem } from '../../shared/system/ISystem';
import type { GPU } from '../GpuDeviceSystem';

/** System plugin to the renderer to manage WebGL state machines. */
export class GpuStateSystem implements ISystem
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererSystem,
        ],
        name: 'state',
    };
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
     * @default PIXI.BLEND_MODES.NONE
     * @readonly
     */
    public blendMode: BLEND_MODES;

    /** Whether current blend equation is different */
    protected _blendEq: boolean;

    /**
     * GL context
     * @member {WebGLRenderingContext}
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

    contextChange(gpu: GPU): void
    {
        this.gpu = gpu;
    }

    getColorTargets(state: State): GPUColorTargetState[]
    {
        const blend = GpuBlendModesToPixi[state.blendMode & 0b1111];

        return [
            {
                format: 'bgra8unorm',
                writeMask: 0,
                blend,
            },
        ];
    }

    destroy(): void
    {
        this.gpu = null;
    }
}
