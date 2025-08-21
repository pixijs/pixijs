import { extensions, ExtensionType } from '../extensions/Extensions';
import { gl2DContainerNodeParser } from './deserialize/node/containerParser';
import { gl2DSpriteNodeParser } from './deserialize/node/spriteParser';
import { gl2DSpritesheetParser } from './deserialize/resource/spritesheetParser';
import { gl2DTextureParser } from './deserialize/resource/textureParser';
import { gl2DTextureSourceParser } from './deserialize/resource/textureSourceParser';
import { GL2D } from './GL2D';

export * from './index';

extensions
    .handleByList(ExtensionType.GL2DNodeParser, GL2D.nodeParsers)
    .handleByList(ExtensionType.GL2DResourceParser, GL2D.resourceParsers);
extensions.add(gl2DContainerNodeParser, gl2DSpriteNodeParser);
extensions.add(gl2DTextureParser, gl2DTextureSourceParser, gl2DSpritesheetParser);
