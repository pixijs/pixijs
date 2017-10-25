/**
 * Additional PIXI DisplayObjects for animation, tiling and bitmap text.
 * @namespace PIXI.extras
 */
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';
export * from '@pixi/text-bitmap';

// imported for side effect of extending the prototype only, contains no exports
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';
