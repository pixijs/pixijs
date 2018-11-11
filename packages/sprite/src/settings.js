import { settings } from '@pixi/settings';

/**
 * Sets the default anchor for all subsequently created sprites,
 * if a default anchor hasn't already been supplied by the texture.
 *
 * The anchor sets the origin point of the texture.
 *
 * Setting the anchor to `x:0,y:0`, means the texture's origin is the top left corner.
 *
 * Setting the anchor to `x:0.5,y:0.5` means the texture's origin is centered.
 *
 * Setting the anchor to `x:1,y:1` means the texture's origin is the bottom right corner.
 *
 * @static
 * @memberof PIXI.settings
 * @name SPRITE_DEFAULT_ANCHOR
 * @type {PIXI.Point}
 * @default {x:0, y:0}
 */
settings.SPRITE_DEFAULT_ANCHOR = {
    x: 0,
    y: 0,
};

export { settings };
