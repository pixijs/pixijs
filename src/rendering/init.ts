import { extensions } from '../extensions/Extensions';
import { AlphaMask } from './mask/alpha/AlphaMask';
import { ColorMask } from './mask/color/ColorMask';
import { StencilMask } from './mask/stencil/StencilMask';
import { BufferImageSource } from './renderers/shared/texture/sources/BufferImageSource';
import { CanvasSource } from './renderers/shared/texture/sources/CanvasSource';
import { ImageSource } from './renderers/shared/texture/sources/ImageSource';
import { VideoSource } from './renderers/shared/texture/sources/VideoSource';
import './renderers/shared/texture/utils/textureFrom';
import './mask/MaskEffectManager';

/**
 * The rendering namespace contains all the classes used for core rendering in PixiJS
 * this includes all the lower level resources such as Textures, Shaders, State, Buffers,
 * Geometry and the systems required to use them. This covers WebGL and WebGPU and their shared classes.
 *
 * To automatically create a renderer based on available resources, see the {@link rendering.autoDetectRenderer} function.
 * @namespace rendering
 */

extensions.add(AlphaMask, ColorMask, StencilMask, VideoSource, ImageSource, CanvasSource, BufferImageSource);

