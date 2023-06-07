import { TilingSpritePipe } from '../../../../tiling-sprite/TilingSpritePipe';
import { BatcherPipe } from '../../../batcher/shared/BatcherPipe';
import { FilterPipe } from '../../../filters/shared/FilterPipe';
import { FilterSystem } from '../../../filters/shared/FilterSystem';
import { GraphicsContextSystem } from '../../../graphics/shared/GraphicsContextSystem';
import { GraphicsPipe } from '../../../graphics/shared/GraphicsPipe';
import { AlphaMaskPipe } from '../../../mask/shared/AlphaMaskPipe';
import { ColorMaskPipe } from '../../../mask/shared/ColorMaskPipe';
import { StencilMaskPipe } from '../../../mask/shared/StencilMaskPipe';
import { MeshPipe } from '../../../mesh/shared/MeshPipe';
import { LayerPipe } from '../../../scene/LayerPipe';
import { LayerSystem } from '../../../scene/LayerSystem';
import { SpritePipe } from '../../../sprite/shared/SpritePipe';
import { BitmapTextPipe } from '../../../text/bitmap/BitmapTextPipe';
import { CanvasTextPipe } from '../../../text/canvas/CanvasTextPipe';
import { CanvasTextSystem } from '../../../text/canvas/CanvasTextSystem';
import { BackgroundSystem } from '../background/BackgroundSystem';
import { BlendModePipe } from '../BlendModePipe';
import { GlobalUniformSystem } from '../renderTarget/GlobalUniformSystem';
import { UniformBufferSystem } from '../shader/UniformBufferSystem';
import { StartupSystem } from '../startup/StartupSystem';
import { ViewSystem } from '../ViewSystem';

import type { GLRenderPipes } from '../../gl/WebGLSystems';
import type { GPURenderPipes } from '../../gpu/WebGPUSystems';
import type { BackgroundSystemOptions } from '../background/BackgroundSystem';
import type { StartupSystemOptions } from '../startup/StartupSystem';
import type { ViewSystemOptions } from '../ViewSystem';

export interface SharedRenderSystems extends PixiMixins.SharedRenderSystems
{
    view: ViewSystem,
    startup: StartupSystem,
    background: BackgroundSystem,
    uniformBuffer: UniformBufferSystem,
    // // pixi 2d

    layer: LayerSystem,

    globalUniforms: GlobalUniformSystem,

    // // graphics context
    graphicsContext: GraphicsContextSystem,
    canvasText: CanvasTextSystem,

    // filters
    filter: FilterSystem
}

export interface SharedRenderPipes extends PixiMixins.SharedRenderPipes
{
    blendMode: BlendModePipe,
    batch: BatcherPipe,
    sprite: SpritePipe,
    layer: LayerPipe,
    mesh: MeshPipe,
    graphics: GraphicsPipe,
    text: CanvasTextPipe,
    bitmapText: BitmapTextPipe,

    tilingSprite: TilingSpritePipe,

    filter: FilterPipe,

    alphaMask: AlphaMaskPipe,
    stencilMask: StencilMaskPipe,
    colorMask: ColorMaskPipe,

}

export type RenderSystems<T extends Record<string, any>> = SharedRenderSystems & {
    [K in keyof T]: InstanceType<T[K]>;
};

export type SharedPipes<T extends Record<string, any>> = SharedRenderPipes & {
    [K in keyof T]: InstanceType<T[K]>;
};

export type RenderPipes = GLRenderPipes | GPURenderPipes;

export interface SharedRendererOptions extends PixiMixins.SharedRendererOptions, BackgroundSystemOptions,
    ViewSystemOptions,
    StartupSystemOptions
{}

export const SharedDefaultRendererOptions = {
    ...BackgroundSystem.defaultOptions,
    ...ViewSystem.defaultOptions,
    ...StartupSystem.defaultOptions
};

export const SharedRendererExtensions = [
    GraphicsContextSystem,
    FilterSystem,
    BackgroundSystem,
    GlobalUniformSystem,
    UniformBufferSystem,
    StartupSystem,
    ViewSystem,
    CanvasTextSystem,
    LayerSystem,
    // Render Pipes
    BatcherPipe,
    FilterPipe,
    GraphicsPipe,
    BlendModePipe,
    AlphaMaskPipe,
    ColorMaskPipe,
    StencilMaskPipe,
    MeshPipe,
    SpritePipe,
    LayerPipe,
    TilingSpritePipe,
    BitmapTextPipe,
    CanvasTextPipe,
];
