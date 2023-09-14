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
import { HTMLTextPipe } from '../../../text/html/HTMLTextPipe';
import { HTMLTextSystem } from '../../../text/html/HTMLTextSystem';
import { BackgroundSystem } from '../background/BackgroundSystem';
import { BlendModePipe } from '../BlendModePipe';
import { ExtractSystem } from '../ExtractSystem';
import { GenerateTextureSystem } from '../GenerateTextureSystem';
import { GlobalUniformSystem } from '../renderTarget/GlobalUniformSystem';
import { UniformBufferSystem } from '../shader/UniformBufferSystem';
import { HelloSystem } from '../startup/HelloSystem';
import { TextureGCSystem } from '../texture/TextureGCSystem';
import { ViewSystem } from '../ViewSystem';

export const SharedSystems = [
    BackgroundSystem,
    FilterSystem,
    GraphicsContextSystem,
    GlobalUniformSystem,
    HelloSystem,
    ViewSystem,
    CanvasTextSystem,
    HTMLTextSystem,
    LayerSystem,
    UniformBufferSystem,
    TextureGCSystem,
    GenerateTextureSystem,
    ExtractSystem,
];

export const SharedRenderPipes = [
    BlendModePipe,
    BatcherPipe,
    SpritePipe,
    LayerPipe,
    MeshPipe,
    GraphicsPipe,
    CanvasTextPipe,
    HTMLTextPipe,
    BitmapTextPipe,
    TilingSpritePipe,
    FilterPipe,
    AlphaMaskPipe,
    StencilMaskPipe,
    ColorMaskPipe,
];
