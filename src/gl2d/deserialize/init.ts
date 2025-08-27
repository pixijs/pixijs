import { extensions } from '../../extensions/Extensions';
import { gl2DContainerNodeParser } from './node/containerParser';
import { gl2DNineSliceSpriteNodeParser } from './node/nineSliceParser';
import { gl2DSpriteNodeParser } from './node/spriteParser';
import { gl2DTilingSpriteNodeParser } from './node/tilingSpriteParser';
import { gl2DSpritesheetParser } from './resource/spritesheetParser';
import { gl2DTextureParser } from './resource/textureParser';
import { gl2DTextureSourceParser } from './resource/textureSourceParser';

extensions.add(
    gl2DContainerNodeParser,
    gl2DSpriteNodeParser,
    gl2DTilingSpriteNodeParser,
    gl2DNineSliceSpriteNodeParser,
    gl2DSpritesheetParser,
    gl2DTextureParser,
    gl2DTextureSourceParser,
);
