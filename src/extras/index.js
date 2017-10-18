/**
 * Additional PIXI DisplayObjects for animation, tiling and bitmap text.
 * @namespace PIXI.extras
 */
export { default as AnimatedSprite } from './AnimatedSprite';
export { default as TilingSprite } from './TilingSprite';
export { default as TilingSpriteRenderer } from './webgl/TilingSpriteRenderer';
export { default as BitmapText } from './BitmapText';

// imported for side effect of extending the prototype only, contains no exports
import './cacheAsBitmap';
import './getChildByName';
import './getGlobalPosition';
