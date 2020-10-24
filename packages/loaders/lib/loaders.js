/*!
 * @pixi/loaders - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/loaders is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var resourceLoader = require('resource-loader');
var core = require('@pixi/core');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Loader plugin for handling Texture resources.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
var TextureLoader = /** @class */ (function () {
    function TextureLoader() {
    }
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    TextureLoader.use = function (resource, next) {
        // create a new texture if the data is an Image object
        if (resource.data && resource.type === resourceLoader.Resource.TYPE.IMAGE) {
            resource.texture = core.Texture.fromLoader(resource.data, resource.url, resource.name);
        }
        next();
    };
    return TextureLoader;
}());

/**
 * The new loader, extends Resource Loader by Chad Engler: https://github.com/englercj/resource-loader
 *
 * ```js
 * const loader = PIXI.Loader.shared; // PixiJS exposes a premade instance for you to use.
 * //or
 * const loader = new PIXI.Loader(); // you can also create your own if you want
 *
 * const sprites = {};
 *
 * // Chainable `add` to enqueue a resource
 * loader.add('bunny', 'data/bunny.png')
 *       .add('spaceship', 'assets/spritesheet.json');
 * loader.add('scoreFont', 'assets/score.fnt');
 *
 * // Chainable `pre` to add a middleware that runs for each resource, *before* loading that resource.
 * // This is useful to implement custom caching modules (using filesystem, indexeddb, memory, etc).
 * loader.pre(cachingMiddleware);
 *
 * // Chainable `use` to add a middleware that runs for each resource, *after* loading that resource.
 * // This is useful to implement custom parsing modules (like spritesheet parsers, spine parser, etc).
 * loader.use(parsingMiddleware);
 *
 * // The `load` method loads the queue of resources, and calls the passed in callback called once all
 * // resources have loaded.
 * loader.load((loader, resources) => {
 *     // resources is an object where the key is the name of the resource loaded and the value is the resource object.
 *     // They have a couple default properties:
 *     // - `url`: The URL that the resource was loaded from
 *     // - `error`: The error that happened when trying to load (if any)
 *     // - `data`: The raw data that was loaded
 *     // also may contain other properties based on the middleware that runs.
 *     sprites.bunny = new PIXI.TilingSprite(resources.bunny.texture);
 *     sprites.spaceship = new PIXI.TilingSprite(resources.spaceship.texture);
 *     sprites.scoreFont = new PIXI.TilingSprite(resources.scoreFont.texture);
 * });
 *
 * // throughout the process multiple signals can be dispatched.
 * loader.onProgress.add(() => {}); // called once per loaded/errored file
 * loader.onError.add(() => {}); // called once per errored file
 * loader.onLoad.add(() => {}); // called once per loaded file
 * loader.onComplete.add(() => {}); // called once when the queued resources all load.
 * ```
 *
 * @see https://github.com/englercj/resource-loader
 *
 * @class Loader
 * @memberof PIXI
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
var Loader = /** @class */ (function (_super) {
    __extends(Loader, _super);
    function Loader(baseUrl, concurrency) {
        var _this = _super.call(this, baseUrl, concurrency) || this;
        for (var i = 0; i < Loader._plugins.length; ++i) {
            var plugin = Loader._plugins[i];
            var pre = plugin.pre, use = plugin.use;
            if (pre) {
                _this.pre(pre);
            }
            if (use) {
                _this.use(use);
            }
        }
        /**
         * If this loader cannot be destroyed.
         * @member {boolean}
         * @default false
         * @private
         */
        _this._protected = false;
        return _this;
    }
    /**
     * Destroy the loader, removes references.
     * @memberof PIXI.Loader#
     * @method destroy
     * @public
     */
    Loader.prototype.destroy = function () {
        if (!this._protected) {
            this.reset();
        }
    };
    Object.defineProperty(Loader, "shared", {
        /**
         * A premade instance of the loader that can be used to load resources.
         * @name shared
         * @type {PIXI.Loader}
         * @static
         * @memberof PIXI.Loader
         */
        get: function () {
            var shared = Loader._shared;
            if (!shared) {
                shared = new Loader();
                shared._protected = true;
                Loader._shared = shared;
            }
            return shared;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds a Loader plugin for the global shared loader and all
     * new Loader instances created.
     *
     * @static
     * @method registerPlugin
     * @memberof PIXI.Loader
     * @param {PIXI.ILoaderPlugin} plugin - The plugin to add
     * @return {PIXI.Loader} Reference to PIXI.Loader for chaining
     */
    Loader.registerPlugin = function (plugin) {
        Loader._plugins.push(plugin);
        if (plugin.add) {
            plugin.add();
        }
        return Loader;
    };
    /**
     * Collection of all installed `use` middleware for Loader.
     *
     * @static
     * @member {Array<PIXI.ILoaderPlugin>} _plugins
     * @memberof PIXI.Loader
     * @private
     */
    Loader._plugins = [];
    return Loader;
}(resourceLoader.Loader));
// parse any blob into more usable objects (e.g. Image)
Loader.registerPlugin({ use: resourceLoader.middleware.parsing });
// parse any Image objects into textures
Loader.registerPlugin(TextureLoader);
/**
 * Plugin to be installed for handling specific Loader resources.
 *
 * @memberof PIXI
 * @typedef {object} ILoaderPlugin
 * @property {function} [add] - Function to call immediate after registering plugin.
 * @property {PIXI.Loader.loaderMiddleware} [pre] - Middleware function to run before load, the
 *           arguments for this are `(resource, next)`
 * @property {PIXI.Loader.loaderMiddleware} [use] - Middleware function to run after load, the
 *           arguments for this are `(resource, next)`
 */
/**
 * @memberof PIXI.Loader
 * @typedef {object} ICallbackID
 */
/**
 * @memberof PIXI.Loader
 * @typedef {function} ISignalCallback
 * @param {function} callback - Callback function
 * @param {object} [context] - Context
 * @returns {ICallbackID} - CallbackID
 */
/**
 * @memberof PIXI.Loader
 * @typedef {function} ISignalDetach
 * @param {ICallbackID} id - CallbackID returned by `add`/`once` methods
 */
/**
 * @memberof PIXI.Loader
 * @typedef ILoaderSignal
 * @property {ISignalCallback} add - Register callback
 * @property {ISignalCallback} once - Register oneshot callback
 * @property {ISignalDetach} detach - Detach specific callback by ID
 */
/**
 * Callback
 * @memberof PIXI.Loader
 * @typedef {function} loaderMiddleware
 * @param {PIXI.LoaderResource} resource
 * @param {function} next
 */
/**
 * Dispatched when the loader begins to loading process.
 * @name onStart
 * @memberof PIXI.Loader#
 * @member {PIXI.Loader.ILoaderSignal}
 */
/**
 * Dispatched once per loaded or errored resource.
 * @name onProgress
 * @memberof PIXI.Loader#
 * @member {PIXI.Loader.ILoaderSignal} onProgress
 */
/**
 * Dispatched once per errored resource.
 * @name onError
 * @memberof PIXI.Loader#
 * @member {PIXI.Loader.ILoaderSignal}
 */
/**
 * Dispatched once per loaded resource.
 * @name onLoad
 * @memberof PIXI.Loader#
 * @member {PIXI.Loader.ILoaderSignal}
 */
/**
 * Dispatched when completely loaded all resources.
 * @name onComplete
 * @memberof PIXI.Loader#
 * @member {PIXI.Loader.ILoaderSignal}
 */

/**
 * Application plugin for supporting loader option. Installing the LoaderPlugin
 * is not necessary if using **pixi.js** or **pixi.js-legacy**.
 * @example
 * import {AppLoaderPlugin} from '@pixi/loaders';
 * import {Application} from '@pixi/app';
 * Application.registerPlugin(AppLoaderPlugin);
 * @class
 * @memberof PIXI
 */
var AppLoaderPlugin = /** @class */ (function () {
    function AppLoaderPlugin() {
    }
    /**
     * Called on application constructor
     * @param {object} options
     * @private
     */
    AppLoaderPlugin.init = function (options) {
        options = Object.assign({
            sharedLoader: false,
        }, options);
        /**
         * Loader instance to help with asset loading.
         * @memberof PIXI.Application#
         * @type {PIXI.Loader}
         * @readonly
         */
        this.loader = options.sharedLoader ? Loader.shared : new Loader();
    };
    /**
     * Called when application destroyed
     *
     * @private
     */
    AppLoaderPlugin.destroy = function () {
        if (this.loader) {
            this.loader.destroy();
            this.loader = null;
        }
    };
    return AppLoaderPlugin;
}());

/**
* Reference to **{@link https://github.com/englercj/resource-loader}**'s Resource class.
* @see https://englercj.github.io/resource-loader/classes/resource.html
* @class LoaderResource
* @memberof PIXI
*/
var LoaderResource = resourceLoader.Resource;

exports.AppLoaderPlugin = AppLoaderPlugin;
exports.Loader = Loader;
exports.LoaderResource = LoaderResource;
exports.TextureLoader = TextureLoader;
//# sourceMappingURL=loaders.js.map
