import { TextureStyle } from '../../../rendering/renderers/shared/texture/TextureStyle';
import { warn } from '../../../utils/logging/warn';

let warned = false;

/**
 * Warns once when a text texture style carries anything beyond scaleMode, which is the only
 * field a pooled text texture honours.
 * @param textureStyle - the style given to a Text or HTMLText
 * @internal
 */
export function warnIgnoredTextureStyle(textureStyle: TextureStyle): void
{
    // #if _DEBUG
    if (warned) return;

    // styles with the same sampler parameters share a resource id, so a style that only sets
    // scaleMode matches a fresh style built from that scaleMode alone
    const scaleModeOnly = new TextureStyle({ scaleMode: textureStyle.scaleMode });

    if (textureStyle._resourceId === scaleModeOnly._resourceId) return;

    warned = true;
    warn('Text textureStyle: only scaleMode is applied to a text texture, the other fields are ignored');
    // #endif
}
