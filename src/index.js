// import polyfills. Done as an export to make sure polyfills are imported first
export * from './polyfill';

// export core
export * from './deprecation';
export * from './core';

// export libs
import * as accessibility from './accessibility';
import * as extract from './extract';
import * as extras from './extras';
import * as filters from './filters';
import * as interaction from './interaction';
import * as loaders from './loaders';
import * as mesh from './mesh';
import * as particles from './particles';
import * as prepare from './prepare';

// handle mixins now, after all code has been added, including deprecation
import { utils } from './core';
utils.mixins.performMixins();

export {
    accessibility,
    extract,
    extras,
    filters,
    interaction,
    loaders,
    mesh,
    particles,
    prepare,
};

/**
 * A premade instance of the loader that can be used to load resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
const loader = loaders && loaders.Loader ? new loaders.Loader() : null; // check is there in case user excludes loader lib

export { loader };

// Always export pixi globally.
global.PIXI = exports; // eslint-disable-line
