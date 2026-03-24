import { ExtensionType } from '../../../../extensions/Extensions';
import { warn } from '../../../../utils/logging/warn';
import { ensureAttributes } from '../../gl/shader/program/ensureAttributes';
import { ShaderOverrides } from '../../shared/shader/ShaderOverrides';
import { STENCIL_MODES } from '../../shared/state/const';
import { createIdFromString } from '../../shared/utils/createIdFromString';
import { GpuStencilModesToPixi } from '../state/GpuStencilModesToPixi';

import type { Topology } from '../../shared/geometry/const';
import type { Geometry } from '../../shared/geometry/Geometry';
import type { State } from '../../shared/state/State';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { GpuRenderTarget } from '../renderTarget/GpuRenderTarget';
import type { GpuProgram } from '../shader/GpuProgram';
import type { StencilState } from '../state/GpuStencilModesToPixi';
import type { WebGPURenderer } from '../WebGPURenderer';

const topologyStringToId = {
    'point-list': 0,
    'line-list': 1,
    'line-strip': 2,
    'triangle-list': 3,
    'triangle-strip': 4,
};

const emptyOverrides = new ShaderOverrides({});

const depthStencilFormatMap: Record<string, { depth: boolean, stencil: boolean, index: number }> = {
    'depth24plus-stencil8': { depth: true, stencil: true, index: 0 },
    depth24plus: { depth: true, stencil: false, index: 1 },
    depth32float: { depth: true, stencil: false, index: 2 },
    'depth32float-stencil8': { depth: true, stencil: true, index: 3 },
    depth16unorm: { depth: true, stencil: false, index: 4 },
    stencil8: { depth: false, stencil: true, index: 5 },
};

const emptyDepthStencilFormatData = { depth: false, stencil: false, index: 0 };

/**
 * Rewrites WGSL source by replacing `override` declarations with `const` declarations
 * whose values are baked in from the provided overrides map. Used as a fallback for
 * browsers that don't support the `constants` field in `GPURenderPipelineDescriptor` (e.g. Safari).
 *
 * Values are formatted according to WGSL literal rules:
 * - `u32` → unsigned integer suffix (`42u`)
 * - `i32` → plain integer (`42`)
 * - `f32` → float with decimal point (`42.0`)
 * @param source - The WGSL shader source string containing `override` declarations.
 * @param overrides - A map of override names to their numeric values.
 * @returns The modified WGSL source with matching `override` declarations replaced by `const`.
 * @internal
 * @ignore
 */
export function bakeOverridesIntoSource(source: string, overrides: Record<string, number>): string
{
    for (const [name, value] of Object.entries(overrides))
    {
        const re = new RegExp(
            `override\\s+${name}\\s*:\\s*(\\w+)\\s*(?:=[^;]*)?;`
        );

        source = source.replace(re, (_, type) =>
        {
            let lit: string;

            if (type === 'u32') lit = `${Math.trunc(value)}u`;
            else if (type === 'i32') lit = `${Math.trunc(value)}`;
            else lit = Number.isInteger(value) ? `${value}.0` : `${value}`;

            return `const ${name}: ${type} = ${lit};`;
        });
    }

    return source;
}

// geometryLayouts = 256; // 8 bits // 256 states // value 0-255;
// shaderKeys = 256; // 8 bits // 256 states // value 0-255;
// state = 64; // 6 bits // 64 states // value 0-63;
// blendMode = 32; // 5 bits // 32 states // value 0-31;
// topology = 8; // 3 bits // 8 states // value 0-7;
function getGraphicsStateKey(
    geometryLayout: number,
    shaderKey: number,
    state: number,
    blendMode: number,
    topology: number,
    overrideId: number
): number
{
    return (geometryLayout * 35184372088832) // 2^45 - 8 bits space for geometry (256)
    + (shaderKey * 536870912) // 2^29 - 16 bits space for shader (65,536)
    + (overrideId * 16384) // 2^14 - 15 bits space for overrides (32,768)
    + (state << 8)
    + (blendMode << 3)
    + topology;
}

// colorMask = 16;// 4 bits // 16 states // value 0-15;
// stencilState = 8; // 3 bits // 8 states // value 0-7;
// renderTarget = 1; // 2 bit // 3 states // value 0-3; // none, stencil, depth, depth-stencil
// multiSampleCount = 1; // 1 bit // 2 states // value 0-1;
// colorTargetCount = 4; // 2 bits // 4 states // value 0-3; // supports 1-4 color targets
// depthStencilFormat = 7; // 3 bits // 8 states // value 0-7;
function getGlobalStateKey(
    stencilStateId: number,
    multiSampleCount: number,
    colorMask: number,
    colorTargetCount: number,
    depthStencilFormat: number,
): number
{
    return (depthStencilFormat << 12) // Allocate 3 bits
         | (colorMask << 8) // Allocate the 4 bits for colorMask at the top
         | (stencilStateId << 5) // Next 3 bits for stencilStateId
         | (colorTargetCount << 1) // 2 bits for colorTargetCount
         | multiSampleCount; // And 1 bit for multiSampleCount at the least significant position
}

type PipeHash = Record<number, GPURenderPipeline>;

/**
 * A system that creates and manages the GPU pipelines.
 *
 * Caching Mechanism: At its core, the system employs a two-tiered caching strategy to minimize
 * the redundant creation of GPU pipelines (or "pipes"). This strategy is based on generating unique
 * keys that represent the state of the graphics settings and the specific requirements of the
 * item being rendered. By caching these pipelines, subsequent draw calls with identical configurations
 * can reuse existing pipelines instead of generating new ones.
 *
 * State Management: The system differentiates between "global" state properties (like color masks
 * and stencil masks, which do not change frequently) and properties that may vary between draw calls
 * (such as geometry, shaders, and blend modes). Unique keys are generated for both these categories
 * using getStateKey for global state and getGraphicsStateKey for draw-specific settings. These keys are
 * then then used to caching the pipe. The next time we need a pipe we can check
 * the cache by first looking at the state cache and then the pipe cache.
 * @category rendering
 * @advanced
 */
export class PipelineSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'pipeline',
    } as const;
    private readonly _renderer: WebGPURenderer;

    protected CONTEXT_UID: number;

    private _moduleCache: Record<string, GPUShaderModule> = Object.create(null);
    private _bufferLayoutsCache: Record<number, GPUVertexBufferLayout[]> = Object.create(null);
    private readonly _bindingNamesCache: Record<string, Record<string, string>> = Object.create(null);

    private _pipeCache: PipeHash = Object.create(null);
    private readonly _pipeStateCaches: Record<number, PipeHash> = Object.create(null);

    private _gpu: GPU;
    private _stencilState: StencilState;

    private _stencilMode: STENCIL_MODES;
    private _colorMask = 0b1111;
    private _multisampleCount = 1;
    private _colorTargetCount = 1;
    private _depthStencilFormat: GPUTextureFormat = 'depth24plus-stencil8';
    private _depthStencilFormatData = emptyDepthStencilFormatData;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this.setStencilMode(STENCIL_MODES.DISABLED);

        this._updatePipeHash();
    }

    public setMultisampleCount(multisampleCount: number): void
    {
        if (this._multisampleCount === multisampleCount) return;

        this._multisampleCount = multisampleCount;

        this._updatePipeHash();
    }

    public setRenderTarget(renderTarget: GpuRenderTarget)
    {
        this._multisampleCount = renderTarget.msaaSamples;
        this._colorTargetCount = renderTarget.colorTargetCount;
        this._depthStencilFormat = renderTarget.depthStencilFormat;
        this._depthStencilFormatData = depthStencilFormatMap[this._depthStencilFormat] || emptyDepthStencilFormatData;
        this._updatePipeHash();
    }

    public setColorMask(colorMask: number): void
    {
        if (this._colorMask === colorMask) return;

        this._colorMask = colorMask;

        this._updatePipeHash();
    }

    public setStencilMode(stencilMode: STENCIL_MODES): void
    {
        if (this._stencilMode === stencilMode) return;

        this._stencilMode = stencilMode;
        this._stencilState = GpuStencilModesToPixi[stencilMode];

        this._updatePipeHash();
    }

    /**
     * Builds a {@link GPURenderBundleEncoderDescriptor} that matches the current render target
     * configuration (color formats, sample count, and depth/stencil format).
     * Used by {@link GpuEncoderSystem.beginBundle} to create a compatible render bundle encoder.
     * @returns A descriptor for creating a GPURenderBundleEncoder.
     */
    public getBundleDescriptor(): GPURenderBundleEncoderDescriptor
    {
        const colorFormats: GPUTextureFormat[] = [];

        for (let i = 0; i < this._colorTargetCount; i++)
        {
            colorFormats.push('bgra8unorm');
        }

        const descriptor: GPURenderBundleEncoderDescriptor = {
            colorFormats,
            sampleCount: this._multisampleCount,
        };

        if (this._depthStencilFormatData.depth || this._depthStencilFormatData.stencil)
        {
            descriptor.depthStencilFormat = this._depthStencilFormat;
        }

        return descriptor;
    }

    public setPipeline(geometry: Geometry, program: GpuProgram, state: State, passEncoder: GPURenderPassEncoder): void
    {
        const pipeline = this.getPipeline(geometry, program, state);

        passEncoder.setPipeline(pipeline);
    }

    /**
     * Generates a key for the pipeline.advanced usage only.
     * @param geometry - The geometry to get the key for
     * @param program - The program to get the key for
     * @param state - The state to get the key for
     * @param topology - The topology to get the key for
     * @param overrides - The overrides to get the key for
     * @returns The key for the pipeline
     */
    public getPipelineKey(
        geometry: Geometry,
        program: GpuProgram,
        state: State,
        topology: Topology,
        overrides: ShaderOverrides,
    ): number
    {
        if (!geometry._layoutKey)
        {
            ensureAttributes(geometry, program.attributeData);

            // prepare the geometry for the pipeline
            this._generateBufferKey(geometry);
        }

        return getGraphicsStateKey(
            geometry._layoutKey,
            program._layoutKey,
            state.data,
            state._blendModeId,
            topologyStringToId[topology],
            overrides.id,
        );
    }

    public getPipeline(
        geometry: Geometry,
        program: GpuProgram,
        state: State,
        topology?: Topology,
        overrides?: ShaderOverrides,
    ): GPURenderPipeline
    {
        if (!geometry._layoutKey)
        {
            ensureAttributes(geometry, program.attributeData);

            // prepare the geometry for the pipeline
            this._generateBufferKey(geometry);
        }

        topology ||= geometry.topology;
        overrides ||= emptyOverrides;

        // now we have set the Ids - the key is different...
        const key = getGraphicsStateKey(
            geometry._layoutKey,
            program._layoutKey,
            state.data,
            state._blendModeId,
            topologyStringToId[topology],
            overrides.id,
        );

        if (this._pipeCache[key]) return this._pipeCache[key];

        this._pipeCache[key] = this._createPipeline(geometry, program, state, topology, overrides);

        return this._pipeCache[key];
    }

    private _createPipeline(
        geometry: Geometry,
        program: GpuProgram,
        state: State,
        topology: Topology,
        overrides: ShaderOverrides
    ): GPURenderPipeline
    {
        const device = this._gpu.device;

        const buffers = this._createVertexBufferLayouts(geometry, program);

        const blendModes = this._renderer.state.getColorTargets(state, this._colorTargetCount);

        // Apply write mask to all color targets
        const writeMask = this._stencilMode === STENCIL_MODES.RENDERING_MASK_ADD ? 0 : this._colorMask;

        for (let i = 0; i < blendModes.length; i++)
        {
            blendModes[i].writeMask = writeMask;
        }

        const layout = this._renderer.shader.getProgramData(program).pipeline;

        const hasOverrides = Object.keys(overrides.data).length > 0;

        let vertexSource = program.vertex.source;
        let fragmentSource = program.fragment.source;
        let constants: Record<string, number> | undefined;

        if (hasOverrides)
        {
            if (this._renderer.limits.supportsOverrideConstants)
            {
                constants = overrides.data;
            }
            else
            {
                vertexSource = bakeOverridesIntoSource(vertexSource, overrides.data);
                fragmentSource = bakeOverridesIntoSource(fragmentSource, overrides.data);
            }
        }

        const descriptor: GPURenderPipelineDescriptor = {
            // TODO later check if its helpful to create..
            // layout,
            vertex: {
                module: this._getModule(vertexSource),
                entryPoint: program.vertex.entryPoint,
                constants,
                buffers,
            },
            fragment: {
                module: this._getModule(fragmentSource),
                entryPoint: program.fragment.entryPoint,
                targets: blendModes,
                constants,
            },
            primitive: {
                topology,
                cullMode: state.cullMode,
            },
            layout,
            multisample: {
                count: this._multisampleCount,
            },
            // depthStencil,
            label: `PIXI Pipeline`,
        };

        // only apply if the texture has stencil or depth
        if (this._depthStencilFormatData.depth || this._depthStencilFormatData.stencil)
        {
            const formatData = this._depthStencilFormatData;

            // mask states..
            descriptor.depthStencil = {
                ...this._stencilState,
                format: this._depthStencilFormat,
                depthWriteEnabled: formatData.depth ? state.depthMask : false,
                depthCompare: formatData.depth && state.depthTest ? 'less' : 'always',
            };
        }

        const pipeline = device.createRenderPipeline(descriptor);

        return pipeline;
    }

    private _getModule(code: string): GPUShaderModule
    {
        return this._moduleCache[code] || this._createModule(code);
    }

    private _createModule(code: string): GPUShaderModule
    {
        const device = this._gpu.device;

        this._moduleCache[code] = device.createShaderModule({
            code,
        });

        return this._moduleCache[code];
    }

    /**
     * Generates and caches a numeric layout key on the geometry based on its sorted attribute
     * descriptors (offset, format, stride, instancing). Geometries with identical attribute
     * layouts share the same key, enabling pipeline reuse.
     * @param geometry - The geometry to generate a layout key for.
     */
    private _generateBufferKey(geometry: Geometry): number
    {
        const keyGen = [];
        let index = 0;

        const attributeKeys = Object.keys(geometry.attributes).sort();

        for (let i = 0; i < attributeKeys.length; i++)
        {
            const attribute = geometry.attributes[attributeKeys[i]];

            keyGen[index++] = attribute.offset;
            keyGen[index++] = attribute.format;
            keyGen[index++] = attribute.stride;
            keyGen[index++] = attribute.instance;
        }

        const stringKey = keyGen.join('|');

        geometry._layoutKey = createIdFromString(stringKey, 'geometry');

        return geometry._layoutKey;
    }

    private _generateAttributeLocationsKey(program: GpuProgram): number
    {
        const keyGen = [];
        let index = 0;
        // generate a key..

        const attributeKeys = Object.keys(program.attributeData).sort();

        for (let i = 0; i < attributeKeys.length; i++)
        {
            const attribute = program.attributeData[attributeKeys[i]];

            keyGen[index++] = attribute.location;
        }

        const stringKey = keyGen.join('|');

        program._attributeLocationsKey = createIdFromString(stringKey, 'programAttributes');

        return program._attributeLocationsKey;
    }

    /**
     * Returns a hash of buffer names mapped to bind locations.
     * This is used to bind the correct buffer to the correct location in the shader.
     * @param geometry - The geometry where to get the buffer names
     * @param program - The program where to get the buffer names
     * @returns An object of buffer names mapped to the bind location.
     */
    public getBufferNamesToBind(geometry: Geometry, program: GpuProgram): Record<string, string>
    {
        const key = (geometry._layoutKey << 16) | program._attributeLocationsKey;

        if (this._bindingNamesCache[key]) return this._bindingNamesCache[key];

        const data = this._createVertexBufferLayouts(geometry, program);

        // now map the data to the buffers..
        const bufferNamesToBind: Record<string, string> = Object.create(null);

        const attributeData = program.attributeData;

        for (let i = 0; i < data.length; i++)
        {
            const attributes = Object.values(data[i].attributes);

            const shaderLocation = attributes[0].shaderLocation;

            for (const j in attributeData)
            {
                if (attributeData[j].location === shaderLocation)
                {
                    bufferNamesToBind[i] = j;
                    break;
                }
            }
        }

        this._bindingNamesCache[key] = bufferNamesToBind;

        return bufferNamesToBind;
    }

    private _createVertexBufferLayouts(geometry: Geometry, program: GpuProgram): GPUVertexBufferLayout[]
    {
        if (!program._attributeLocationsKey) this._generateAttributeLocationsKey(program);

        const key = (geometry._layoutKey << 16) | program._attributeLocationsKey;

        if (this._bufferLayoutsCache[key])
        {
            return this._bufferLayoutsCache[key];
        }

        const vertexBuffersLayout: GPUVertexBufferLayout[] = [];

        geometry.buffers.forEach((buffer) =>
        {
            const bufferEntry: GPUVertexBufferLayout = {
                arrayStride: 0,
                stepMode: 'vertex',
                attributes: [],
            };

            const bufferEntryAttributes = bufferEntry.attributes as GPUVertexAttribute[];

            for (const i in program.attributeData)
            {
                const attribute = geometry.attributes[i];

                if ((attribute.divisor ?? 1) !== 1)
                {
                    // TODO: Maybe emulate divisor with storage_buffers/float_textures?
                    // For now just issue a warning
                    warn(`Attribute ${i} has an invalid divisor value of '${attribute.divisor}'. `
                        + 'WebGPU only supports a divisor value of 1');
                }

                if (attribute.buffer === buffer)
                {
                    bufferEntry.arrayStride = attribute.stride;
                    bufferEntry.stepMode = attribute.instance ? 'instance' : 'vertex';

                    bufferEntryAttributes.push({
                        shaderLocation: program.attributeData[i].location,
                        offset: attribute.offset,
                        format: attribute.format,
                    });
                }
            }

            if (bufferEntryAttributes.length)
            {
                vertexBuffersLayout.push(bufferEntry);
            }
        });

        this._bufferLayoutsCache[key] = vertexBuffersLayout;

        return vertexBuffersLayout;
    }

    private _updatePipeHash(): void
    {
        const key = getGlobalStateKey(
            this._stencilMode,
            this._multisampleCount,
            this._colorMask,
            this._colorTargetCount,
            this._depthStencilFormatData.index
        );

        if (!this._pipeStateCaches[key])
        {
            this._pipeStateCaches[key] = Object.create(null);
        }

        this._pipeCache = this._pipeStateCaches[key];
    }

    public destroy(): void
    {
        (this._renderer as null) = null;
        this._bufferLayoutsCache = null;
    }
}
