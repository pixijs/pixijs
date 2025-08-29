import { extensions } from '../../extensions/Extensions';
import { gl2DBitmapTextNodeParser } from './node/bitmapTextParser';
import { gl2DContainerNodeParser } from './node/containerParser';
import { gl2DNineSliceSpriteNodeParser } from './node/nineSliceParser';
import { gl2DSpriteNodeParser } from './node/spriteParser';
import { gl2DTextNodeParser } from './node/textParser';
import { gl2DTilingSpriteNodeParser } from './node/tilingSpriteParser';
import { gl2DBitmapFontParser } from './resource/bitmapFontParser';
import { gl2DGradientParser } from './resource/gradientParser';
import { gl2DSpritesheetParser } from './resource/spritesheetParser';
import { gl2DTextStyleParser } from './resource/textStyleParser';
import { gl2DTextureParser } from './resource/textureParser';
import { gl2DTextureSourceParser } from './resource/textureSourceParser';
import { gl2DWebFontParser } from './resource/webFontParser';

extensions.add(
    gl2DSpritesheetParser,
    gl2DTextureParser,
    gl2DTextureSourceParser,
    gl2DBitmapFontParser,
    gl2DWebFontParser,
    gl2DGradientParser,
    gl2DTextStyleParser,
    gl2DContainerNodeParser,
    gl2DSpriteNodeParser,
    gl2DTilingSpriteNodeParser,
    gl2DNineSliceSpriteNodeParser,
    gl2DTextNodeParser,
    gl2DBitmapTextNodeParser
);
