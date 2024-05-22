import { CustomRenderPipe } from '../../../../scene/container/CustomRenderPipe';
import { RenderGroupPipe } from '../../../../scene/container/RenderGroupPipe';
import { RenderGroupSystem } from '../../../../scene/container/RenderGroupSystem';
import { SpritePipe } from '../../../../scene/sprite/SpritePipe';
import { BatcherPipe } from '../../../batcher/shared/BatcherPipe';
import { AlphaMaskPipe } from '../../../mask/alpha/AlphaMaskPipe';
import { ColorMaskPipe } from '../../../mask/color/ColorMaskPipe';
import { StencilMaskPipe } from '../../../mask/stencil/StencilMaskPipe';
import { BackgroundSystem } from '../background/BackgroundSystem';
import { BlendModePipe } from '../blendModes/BlendModePipe';
import { ExtractSystem } from '../extract/ExtractSystem';
import { GenerateTextureSystem } from '../extract/GenerateTextureSystem';
import { GlobalUniformSystem } from '../renderTarget/GlobalUniformSystem';
import { HelloSystem } from '../startup/HelloSystem';
import { TextureGCSystem } from '../texture/TextureGCSystem';
import { ViewSystem } from '../view/ViewSystem';

import type { ExtractRendererOptions } from './utils/typeUtils';

export const SharedSystems = [
    BackgroundSystem,
    GlobalUniformSystem,
    HelloSystem,
    ViewSystem,
    RenderGroupSystem,
    TextureGCSystem,
    GenerateTextureSystem,
    ExtractSystem,
];

export const SharedRenderPipes = [
    BlendModePipe,
    BatcherPipe,
    SpritePipe,
    RenderGroupPipe,
    AlphaMaskPipe,
    StencilMaskPipe,
    ColorMaskPipe,
    CustomRenderPipe
];

/**
 * Options for the shared systems of a renderer.
 * @memberof rendering
 */
export interface SharedRendererOptions extends ExtractRendererOptions<typeof SharedSystems>, PixiMixins.RendererOptions
{
    /**
     * Whether to manage the dynamic imports of the renderer code. It is true by default, this means
     * PixiJS will load all the default pixi systems and extensions. If you set this to false, then
     * you as the dev will need to manually import the systems and extensions you need.
     */
    manageImports?: boolean;
}
