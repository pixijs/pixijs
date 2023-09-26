import { extensions } from '../extensions/Extensions';
import { AlphaMask } from './mask/alpha/AlphaMask';
import { ColorMask } from './mask/color/ColorMask';
import { StencilMask } from './mask/stencil/StencilMask';

extensions.add(AlphaMask, ColorMask, StencilMask);
