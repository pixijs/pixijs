// import polyfills. Done as an export to make sure polyfills are imported first
import '@pixi/polyfill';

// export core
export * from '@pixi/core';
export * from '@pixi/app';
export * from '@pixi/sprite';
export * from '@pixi/spritesheet';
export * from '@pixi/text';
export * from '@pixi/text-bitmap';
export * from '@pixi/graphics';
export * from '@pixi/sprite-animated';
export * from '@pixi/sprite-tiling';

// export libs
import * as accessibility from '@pixi/accessibility';
import * as interaction from '@pixi/interaction';
import * as extract from '@pixi/extract';
import * as loaders from '@pixi/loaders';
import * as mesh from '@pixi/mesh';
import * as prepare from '@pixi/prepare';
// import * as particles from '@pixi/particles';
import * as filters from './filters';

// imported for side effect of extending the prototype only, contains no exports
import '@pixi/mixin-cache-as-bitmap';
import '@pixi/mixin-get-child-by-name';
import '@pixi/mixin-get-global-position';

import { deprecation } from './deprecation';

// handle mixins now, after all code has been added
import { mixins } from '@pixi/utils';
mixins.performMixins();

/**
 * Alias for {@link PIXI.loaders.shared}.
 * @name loader
 * @memberof PIXI
 * @type {PIXI.loader.Loader}
 */
const loader = loaders.shared || null;

export {
    accessibility,
    extract,
    filters,
    interaction,
    loaders,
    mesh,
    // particles,
    prepare,
    loader,
};

// Always export PixiJS globally.
global.PIXI = exports; // eslint-disable-line

// Apply deprecations
deprecation(global.PIXI);
