import { extensions } from '../../extensions/Extensions';
import { gl2DContainerNodeParser } from './node/containerParser';
import { gl2DSpriteNodeParser } from './node/spriteParser';
import { gl2DSpritesheetParser } from './resource/spritesheetParser';
import { gl2DTextureParser } from './resource/textureParser';
import { gl2DTextureSourceParser } from './resource/textureSourceParser';

extensions.add(
    gl2DContainerNodeParser,
    gl2DSpriteNodeParser,
    gl2DSpritesheetParser,
    gl2DTextureParser,
    gl2DTextureSourceParser,
);
