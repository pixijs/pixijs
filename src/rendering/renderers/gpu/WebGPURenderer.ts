import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { GpuGraphicsAdaptor } from '../../../scene/graphics/gpu/GpuGraphicsAdaptor';
import { GpuMeshAdapter } from '../../../scene/mesh/gpu/GpuMeshAdapter';
import { GpuBatchAdaptor } from '../../batcher/gpu/GpuBatchAdaptor';
import { AbstractRenderer } from '../shared/system/AbstractRenderer';
import { SharedRenderPipes, SharedSystems } from '../shared/system/SharedSystems';
import { RendererType } from '../types';
import { BindGroupSystem } from './BindGroupSystem';
import { GpuBufferSystem } from './buffer/GpuBufferSystem';
import { GpuColorMaskSystem } from './GpuColorMaskSystem';
import { type GPU, GpuDeviceSystem } from './GpuDeviceSystem';
import { GpuEncoderSystem } from './GpuEncoderSystem';
import { GpuLimitsSystem } from './GpuLimitsSystem';
import { GpuStencilSystem } from './GpuStencilSystem';
import { GpuUboSystem } from './GpuUboSystem';
import { GpuUniformBatchPipe } from './GpuUniformBatchPipe';
import { PipelineSystem } from './pipeline/PipelineSystem';
import { GpuRenderTargetSystem } from './renderTarget/GpuRenderTargetSystem';
import { GpuShaderSystem } from './shader/GpuShaderSystem';
import { GpuStateSystem } from './state/GpuStateSystem';
import { GpuTextureSystem } from './texture/GpuTextureSystem';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { SharedRendererOptions } from '../shared/system/SharedSystems';
import type { SystemConstructor } from '../shared/system/System';
import type { ExtractRendererOptions, ExtractSystemTypes } from '../shared/system/utils/typeUtils';

const DefaultWebGPUSystems = [
    ...SharedSystems,
    GpuUboSystem,
    GpuEncoderSystem,
    GpuDeviceSystem,
    GpuLimitsSystem,
    GpuBufferSystem,
    GpuTextureSystem,
    GpuRenderTargetSystem,
    GpuShaderSystem,
    GpuStateSystem,
    PipelineSystem,
    GpuColorMaskSystem,
    GpuStencilSystem,
    BindGroupSystem,
];
const DefaultWebGPUPipes = [...SharedRenderPipes, GpuUniformBatchPipe];
const DefaultWebGPUAdapters = [GpuBatchAdaptor, GpuMeshAdapter, GpuGraphicsAdaptor];

// installed systems will bbe added to this array by the extensions manager..
const systems: { name: string; value: SystemConstructor }[] = [];
const renderPipes: { name: string; value: PipeConstructor }[] = [];
const renderPipeAdaptors: { name: string; value: any }[] = [];

extensions.handleByNamedList(ExtensionType.WebGPUSystem, systems);
extensions.handleByNamedList(ExtensionType.WebGPUPipes, renderPipes);
extensions.handleByNamedList(ExtensionType.WebGPUPipesAdaptor, renderPipeAdaptors);

// add all the default systems as well as any user defined ones from the extensions
extensions.add(...DefaultWebGPUSystems, ...DefaultWebGPUPipes, ...DefaultWebGPUAdapters);

/**
 * The default WebGPU systems. These are the systems that are added by default to the WebGPURenderer.
 * @category rendering
 * @standard
 * @interface
 */
export type WebGPUSystems = ExtractSystemTypes<typeof DefaultWebGPUSystems> &
PixiMixins.RendererSystems &
PixiMixins.WebGPUSystems;

/**
 * The WebGPU renderer pipes. These are used to render the scene.
 * @see {@link WebGPURenderer}
 * @internal
 */
export type WebGPUPipes = ExtractSystemTypes<typeof DefaultWebGPUPipes> &
PixiMixins.RendererPipes &
PixiMixins.WebGPUPipes;

/**
 * Options for WebGPURenderer.
 * @category rendering
 * @standard
 */
export interface WebGPUOptions extends
    SharedRendererOptions,
    ExtractRendererOptions<typeof DefaultWebGPUSystems>,
    PixiMixins.WebGPUOptions{}

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface WebGPURenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGPUPipes, WebGPUOptions, T>,
    WebGPUSystems {}

/* eslint-disable max-len */
/**
 * The WebGPU PixiJS Renderer. This renderer allows you to use the next-generation graphics API, WebGPU.
 * ```ts
 * // Create a new renderer
 * const renderer = new WebGPURenderer();
 * await renderer.init();
 *
 * // Add the renderer to the stage
 * document.body.appendChild(renderer.canvas);
 *
 * // Create a new stage
 * const stage = new Container();
 *
 * // Render the stage
 * renderer.render(stage);
 * ```
 *
 * You can use {@link autoDetectRenderer} to create a renderer that will automatically detect the best
 * renderer for the environment.
 * ```ts
 * import { autoDetectRenderer } from 'pixi.js';
 * // Create a new renderer
 * const renderer = await autoDetectRenderer();
 * ```
 *
 * The renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a WebGPU renderer:
 *
 * | WebGPU Core Systems                      | Systems that are specific to the WebGL renderer                               |
 * | ---------------------------------------- | ----------------------------------------------------------------------------- |
 * | {@link GpuUboSystem}           | This manages WebGPU uniform buffer objects feature for shaders                |
 * | {@link GpuEncoderSystem}       | This manages the WebGPU command encoder                                       |
 * | {@link GpuDeviceSystem}        | This manages the WebGPU Device and its extensions                             |
 * | {@link GpuBufferSystem}        | This manages buffers and their GPU resources, keeps everything in sync        |
 * | {@link GpuTextureSystem}       | This manages textures and their GPU resources, keeps everything in sync       |
 * | {@link GpuRenderTargetSystem}  | This manages what we render too. For example the screen, or another texture   |
 * | {@link GpuShaderSystem}        | This manages shaders, programs that run on the GPU to output lovely pixels    |
 * | {@link GpuStateSystem}         | This manages the state of the WebGPU Pipelines. eg the various flags that can be set blend modes / depthTesting etc |
 * | {@link PipelineSystem}         | This manages the WebGPU pipelines, used for rendering                         |
 * | {@link GpuColorMaskSystem}     | This manages the color mask. Used for color masking                           |
 * | {@link GpuStencilSystem}       | This manages the stencil buffer. Used primarily for masking                   |
 * | {@link BindGroupSystem}        | This manages the WebGPU bind groups. this is how data is bound to a shader when rendering |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @category rendering
 * @standard
 * @property {GpuUboSystem} ubo - UboSystem instance.
 * @property {GpuEncoderSystem} encoder - EncoderSystem instance.
 * @property {GpuDeviceSystem} device - DeviceSystem instance.
 * @property {GpuBufferSystem} buffer - BufferSystem instance.
 * @property {GpuTextureSystem} texture - TextureSystem instance.
 * @property {GpuRenderTargetSystem} renderTarget - RenderTargetSystem instance.
 * @property {GpuShaderSystem} shader - ShaderSystem instance.
 * @property {GpuStateSystem} state - StateSystem instance.
 * @property {PipelineSystem} pipeline - PipelineSystem instance.
 * @property {GpuColorMaskSystem} colorMask - ColorMaskSystem instance.
 * @property {GpuStencilSystem} stencil - StencilSystem instance.
 * @property {BindGroupSystem} bindGroup - BindGroupSystem instance.
 * @extends AbstractRenderer
 */
export class WebGPURenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<WebGPUPipes, WebGPUOptions, T>
    implements WebGPUSystems
{
    /** The WebGPU Device. */
    public gpu: GPU;

    constructor()
    {
        const systemConfig = {
            name: 'webgpu',
            type: RendererType.WEBGPU,
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
