import { extensions, ExtensionType } from '../../../extensions/Extensions';
import { CustomRenderPipe } from '../../../scene/container/CustomRenderPipe';
import { RenderGroupPipe } from '../../../scene/container/RenderGroupPipe';
import { CanvasGraphicsAdaptor } from '../../../scene/graphics/canvas/CanvasGraphicsAdaptor';
import { CanvasParticleContainerAdaptor } from '../../../scene/particle-container/canvas/CanvasParticleContainerAdaptor';
import { ParticleContainerPipe } from '../../../scene/particle-container/shared/ParticleContainerPipe';
import { SpritePipe } from '../../../scene/sprite/SpritePipe';
import { CanvasTextPipe } from '../../../scene/text/canvas/CanvasTextPipe';
import { CanvasTextSystem } from '../../../scene/text/canvas/CanvasTextSystem';
import { HTMLTextPipe } from '../../../scene/text-html/HTMLTextPipe';
import { HTMLTextSystem } from '../../../scene/text-html/HTMLTextSystem';
import { CanvasBatchAdaptor } from '../../batcher/canvas/CanvasBatchAdaptor';
import { BatcherPipe } from '../../batcher/shared/BatcherPipe';
import { AlphaMaskPipe } from '../../mask/alpha/AlphaMaskPipe';
import { CanvasColorMaskPipe } from '../../mask/color/CanvasColorMaskPipe';
import { CanvasStencilMaskPipe } from '../../mask/stencil/CanvasStencilMaskPipe';
import { BlendModePipe } from '../shared/blendModes/BlendModePipe';
import { AbstractRenderer } from '../shared/system/AbstractRenderer';
import { SharedSystems } from '../shared/system/SharedSystems';
import { RendererType } from '../types';
import { CanvasContextSystem } from './CanvasContextSystem';
import { CanvasFilterSystem } from './CanvasFilterSystem';
import { CanvasLimitsSystem } from './CanvasLimitsSystem';
import { CanvasRenderTargetSystem } from './renderTarget/CanvasRenderTargetSystem';
import { CanvasTextureSystem } from './texture/CanvasTextureSystem';

import type { ICanvas } from '../../../environment/canvas/ICanvas';
import type { PipeConstructor } from '../shared/instructions/RenderPipe';
import type { SharedRendererOptions } from '../shared/system/SharedSystems';
import type { SystemConstructor } from '../shared/system/System';
import type { ExtractRendererOptions, ExtractSystemTypes } from '../shared/system/utils/typeUtils';

const DefaultCanvasSystems = [
    ...SharedSystems,
    CanvasContextSystem,
    CanvasFilterSystem,
    CanvasLimitsSystem,
    CanvasTextureSystem,
    CanvasRenderTargetSystem,
    CanvasTextSystem,
    HTMLTextSystem,
];
const DefaultCanvasPipes = [
    BlendModePipe,
    BatcherPipe,
    SpritePipe,
    RenderGroupPipe,
    AlphaMaskPipe,
    CanvasStencilMaskPipe,
    CanvasColorMaskPipe,
    CustomRenderPipe,
    CanvasTextPipe,
    ParticleContainerPipe,
    HTMLTextPipe,
];
const DefaultCanvasAdapters = [
    CanvasBatchAdaptor,
    CanvasGraphicsAdaptor,
    CanvasParticleContainerAdaptor,
];

// installed systems will be added to this array by the extensions manager.
const systems: { name: string; value: SystemConstructor }[] = [];
const renderPipes: { name: string; value: PipeConstructor }[] = [];
const renderPipeAdaptors: { name: string; value: any }[] = [];

extensions.handleByNamedList(ExtensionType.CanvasSystem, systems);
extensions.handleByNamedList(ExtensionType.CanvasPipes, renderPipes);
extensions.handleByNamedList(ExtensionType.CanvasPipesAdaptor, renderPipeAdaptors);

// add all the default systems as well as any user defined ones from the extensions
extensions.add(...DefaultCanvasSystems, ...DefaultCanvasPipes, ...DefaultCanvasAdapters);

/**
 * The default Canvas systems. These are the systems that are added by default to the CanvasRenderer.
 * @category rendering
 * @standard
 * @interface
 */
export type CanvasSystems = ExtractSystemTypes<typeof DefaultCanvasSystems>
& PixiMixins.RendererSystems & PixiMixins.CanvasSystems;

/**
 * The Canvas renderer pipes. These are used to render the scene.
 * @see {@link CanvasRenderer}
 * @internal
 */
export type CanvasPipes = ExtractSystemTypes<typeof DefaultCanvasPipes> & PixiMixins.RendererPipes & PixiMixins.CanvasPipes;

/**
 * Options for CanvasRenderer.
 * @category rendering
 * @standard
 */
export interface CanvasOptions
    extends
    SharedRendererOptions,
    ExtractRendererOptions<typeof DefaultCanvasSystems>,
    PixiMixins.CanvasOptions {}

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface CanvasRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<CanvasPipes, CanvasOptions, T>,
    CanvasSystems {}

/**
 * The Canvas PixiJS Renderer. This renderer allows you to use the HTML Canvas 2D context.
 * @category rendering
 * @standard
 */
export class CanvasRenderer<T extends ICanvas = HTMLCanvasElement>
    extends AbstractRenderer<CanvasPipes, CanvasOptions, T>
    implements CanvasSystems
{
    constructor()
    {
        const systemConfig = {
            name: 'canvas',
            type: RendererType.CANVAS,
            systems,
            renderPipes,
            renderPipeAdaptors,
        };

        super(systemConfig);
    }
}
