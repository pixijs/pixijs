import { extensions } from '../extensions/Extensions';
import { AlphaMask } from './mask/shared/AlphaMask';
import { ColorMask } from './mask/shared/ColorMask';
import { StencilMask } from './mask/shared/StencilMask';

extensions.add(AlphaMask, ColorMask, StencilMask);
