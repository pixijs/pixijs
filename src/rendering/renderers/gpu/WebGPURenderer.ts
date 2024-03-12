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

type WebGPUSystems = ExtractSystemTypes<typeof DefaultWebGPUSystems> &
PixiMixins.RendererSystems &
PixiMixins.WebGPUSystems;

export type WebGPUPipes = ExtractSystemTypes<typeof DefaultWebGPUPipes> &
PixiMixins.RendererPipes &
PixiMixins.WebGPUPipes;

/**
 * Options for WebGPURenderer.
 * @memberof rendering
 */
export interface WebGPUOptions extends
    SharedRendererOptions,
    ExtractRendererOptions<typeof DefaultWebGPUSystems>,
    PixiMixins.WebGPUOptions{}

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
 * You can use {@link rendering.autoDetectRenderer} to create a renderer that will automatically detect the best
 * renderer for the environment.
 * ```ts
 * // Create a new renderer
 * const renderer = await rendering.autoDetectRenderer();
 * ```
 *
 * The renderer is composed of systems that manage specific tasks. The following systems are added by default
 * whenever you create a WebGPU renderer:
 *
 * | WebGPU Core Systems                      | Systems that are specific to the WebGL renderer                               |
 * | ---------------------------------------- | ----------------------------------------------------------------------------- |
 * | {@link rendering.GpuUboSystem}           | This manages WebGPU uniform buffer objects feature for shaders                |
 * | {@link rendering.GpuEncoderSystem}       | This manages the WebGPU command encoder                                       |
 * | {@link rendering.GpuDeviceSystem}        | This manages the WebGPU Device and its extensions                             |
 * | {@link rendering.GpuBufferSystem}        | This manages buffers and their GPU resources, keeps everything in sync        |
 * | {@link rendering.GpuTextureSystem}       | This manages textures and their GPU resources, keeps everything in sync       |
 * | {@link rendering.GpuRenderTargetSystem}  | This manages what we render too. For example the screen, or another texture   |
 * | {@link rendering.GpuShaderSystem}        | This manages shaders, programs that run on the GPU to output lovely pixels    |
 * | {@link rendering.GpuStateSystem}         | This manages the state of the WebGPU Pipelines. eg the various flags that can be set blend modes / depthTesting etc |
 * | {@link rendering.PipelineSystem}         | This manages the WebGPU pipelines, used for rendering                         |
 * | {@link rendering.GpuColorMaskSystem}     | This manages the color mask. Used for color masking                           |
 * | {@link rendering.GpuStencilSystem}       | This manages the stencil buffer. Used primarily for masking                   |
 * | {@link rendering.BindGroupSystem}        | This manages the WebGPU bind groups. this is how data is bound to a shader when rendering |
 *
 * The breadth of the API surface provided by the renderer is contained within these systems.
 * @memberof rendering
 * @property {rendering.GpuUboSystem} ubo - UboSystem instance.
 * @property {rendering.GpuEncoderSystem} encoder - EncoderSystem instance.
 * @property {rendering.GpuDeviceSystem} device - DeviceSystem instance.
 * @property {rendering.GpuBufferSystem} buffer - BufferSystem instance.
 * @property {rendering.GpuTextureSystem} texture - TextureSystem instance.
 * @property {rendering.GpuRenderTargetSystem} renderTarget - RenderTargetSystem instance.
 * @property {rendering.GpuShaderSystem} shader - ShaderSystem instance.
 * @property {rendering.GpuStateSystem} state - StateSystem instance.
 * @property {rendering.PipelineSystem} pipeline - PipelineSystem instance.
 * @property {rendering.GpuColorMaskSystem} colorMask - ColorMaskSystem instance.
 * @property {rendering.GpuStencilSystem} stencil - StencilSystem instance.
 * @property {rendering.BindGroupSystem} bindGroup - BindGroupSystem instance.
 * @extends rendering.AbstractRenderer
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
