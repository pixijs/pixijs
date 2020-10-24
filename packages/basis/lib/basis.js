/*!
 * @pixi/basis - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/basis is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var loaders = require('@pixi/loaders');
var constants = require('@pixi/constants');
var core = require('@pixi/core');
var compressedTextures = require('@pixi/compressed-textures');
var runner = require('@pixi/runner');

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

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) { throw t[1]; } return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) { throw new TypeError("Generator is already executing."); }
        while (_) { try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) { return t; }
            if (y = 0, t) { op = [op[0] & 2, t.value]; }
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) { _.ops.pop(); }
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; } }
        if (op[0] & 5) { throw op[1]; } return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var _a, _b, _c;
(function (BASIS_FORMATS) {
    BASIS_FORMATS[BASIS_FORMATS["cTFETC1"] = 0] = "cTFETC1";
    BASIS_FORMATS[BASIS_FORMATS["cTFETC2"] = 1] = "cTFETC2";
    BASIS_FORMATS[BASIS_FORMATS["cTFBC1"] = 2] = "cTFBC1";
    BASIS_FORMATS[BASIS_FORMATS["cTFBC3"] = 3] = "cTFBC3";
    BASIS_FORMATS[BASIS_FORMATS["cTFBC4"] = 4] = "cTFBC4";
    BASIS_FORMATS[BASIS_FORMATS["cTFBC5"] = 5] = "cTFBC5";
    BASIS_FORMATS[BASIS_FORMATS["cTFBC7"] = 6] = "cTFBC7";
    BASIS_FORMATS[BASIS_FORMATS["cTFPVRTC1_4_RGB"] = 8] = "cTFPVRTC1_4_RGB";
    BASIS_FORMATS[BASIS_FORMATS["cTFPVRTC1_4_RGBA"] = 9] = "cTFPVRTC1_4_RGBA";
    BASIS_FORMATS[BASIS_FORMATS["cTFASTC_4x4"] = 10] = "cTFASTC_4x4";
    BASIS_FORMATS[BASIS_FORMATS["cTFATC_RGB"] = 11] = "cTFATC_RGB";
    BASIS_FORMATS[BASIS_FORMATS["cTFATC_RGBA_INTERPOLATED_ALPHA"] = 12] = "cTFATC_RGBA_INTERPOLATED_ALPHA";
    BASIS_FORMATS[BASIS_FORMATS["cTFRGBA32"] = 13] = "cTFRGBA32";
    BASIS_FORMATS[BASIS_FORMATS["cTFRGB565"] = 14] = "cTFRGB565";
    BASIS_FORMATS[BASIS_FORMATS["cTFBGR565"] = 15] = "cTFBGR565";
    BASIS_FORMATS[BASIS_FORMATS["cTFRGBA4444"] = 16] = "cTFRGBA4444";
})(exports.BASIS_FORMATS || (exports.BASIS_FORMATS = {}));
/* eslint-enable camelcase */
/**
 * Maps {@link BASIS_FORMATS} to {@link PIXI.INTERNAL_FORMATS}
 *
 * @ignore
 */
var BASIS_FORMAT_TO_INTERNAL_FORMAT = (_a = {},
    _a[exports.BASIS_FORMATS.cTFETC1] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL,
    _a[exports.BASIS_FORMATS.cTFBC1] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT,
    _a[exports.BASIS_FORMATS.cTFBC3] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT,
    _a[exports.BASIS_FORMATS.cTFPVRTC1_4_RGB] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
    _a[exports.BASIS_FORMATS.cTFPVRTC1_4_RGBA] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
    _a[exports.BASIS_FORMATS.cTFATC_RGB] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL,
    _a[exports.BASIS_FORMATS.cTFASTC_4x4] = compressedTextures.INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL,
    _a);
/**
 * Maps {@link BASIS_FORMATS} to {@link PIXI.TYPES}. These formats are a fallback when the basis file cannot be transcoded
 * to a valid compressed texture format.
 *
 * NOTE: {@link BASIS_FORMATS.cTFBGR565} is not supported, while {@link BASIS_FORMATS.cTFRGBA4444} is not implemented by
 *  [at]pixi/basis.
 *
 * @ignore
 */
var BASIS_FORMAT_TO_TYPE = (_b = {},
    _b[exports.BASIS_FORMATS.cTFRGBA32] = constants.TYPES.UNSIGNED_BYTE,
    _b[exports.BASIS_FORMATS.cTFRGB565] = constants.TYPES.UNSIGNED_SHORT_5_6_5,
    _b[exports.BASIS_FORMATS.cTFRGBA4444] = constants.TYPES.UNSIGNED_SHORT_4_4_4_4,
    _b);
/**
 * Maps {@link PIXI.INTERNAL_FORMATS} to {@link BASIS_FORMATS}
 *
 * @ignore
 */
var INTERNAL_FORMAT_TO_BASIS_FORMAT = Object.keys(BASIS_FORMAT_TO_INTERNAL_FORMAT)
    .map(function (key) { return Number(key); })
    .reduce(function (reverseMap, basisFormat) {
    reverseMap[BASIS_FORMAT_TO_INTERNAL_FORMAT[basisFormat]] = basisFormat;
    return reverseMap;
}, {});
/**
 * Enumerates the basis formats with alpha components
 *
 * @ignore
 */
var BASIS_FORMATS_ALPHA = (_c = {},
    _c[exports.BASIS_FORMATS.cTFBC3] = true,
    _c[exports.BASIS_FORMATS.cTFPVRTC1_4_RGBA] = true,
    _c[exports.BASIS_FORMATS.cTFASTC_4x4] = true,
    _c);

/**
 * This wraps the transcoder web-worker functionality; it can be converted into a string to get the source code. It expects
 * you to prepend the transcoder JavaScript code so that the `BASIS` namespace is available.
 *
 * The transcoder worker responds to two types of messages: "init" and "transcode". You must always send the first "init"
 * {@link IInitializeTranscoderMessage} message with the WebAssembly binary; if the transcoder is successfully initialized,
 * the web-worker will respond by sending anothor {@link ITranscodeResponse} message with `success: true`.
 *
 * @ignore
 */
function TranscoderWorkerWrapper() {
    var basisBinding;
    var messageHandlers = {
        init: function (message) {
            if (!self.BASIS) {
                console.warn('jsSource was not prepended?');
                return {
                    type: 'init',
                    success: false
                };
            }
            self.BASIS({ wasmBinary: message.wasmSource }).then(function (basisLibrary) {
                basisLibrary.initializeBasis();
                basisBinding = basisLibrary;
                self.postMessage({
                    type: 'init',
                    success: true
                });
            });
            return null;
        },
        transcode: function (message) {
            var basisData = message.basisData;
            var BASIS = basisBinding;
            var data = basisData;
            var basisFile = new BASIS.BasisFile(data);
            var imageCount = basisFile.getNumImages();
            var hasAlpha = basisFile.getHasAlpha();
            var basisFormat = hasAlpha
                ? message.rgbaFormat
                : message.rgbFormat;
            var basisFallbackFormat = 14; // BASIS_FORMATS.cTFRGB565 (cannot import values into web-worker!)
            var imageArray = new Array(imageCount);
            var fallbackMode = false;
            if (!basisFile.startTranscoding()) {
                basisFile.close();
                basisFile.delete();
                return {
                    type: 'transcode',
                    requestID: message.requestID,
                    success: false,
                    imageArray: null
                };
            }
            for (var i = 0; i < imageCount; i++) {
                var levels = basisFile.getNumLevels(i);
                var imageResource = {
                    imageID: i,
                    levelArray: new Array(),
                    width: null,
                    height: null
                };
                for (var j = 0; j < levels; j++) {
                    var format = !fallbackMode ? basisFormat : basisFallbackFormat;
                    var width = basisFile.getImageWidth(i, j);
                    var height = basisFile.getImageHeight(i, j);
                    var byteSize = basisFile.getImageTranscodedSizeInBytes(i, j, format);
                    var alignedWidth = (width + 3) & ~3;
                    var alignedHeight = (height + 3) & ~3;
                    // Level 0 is texture's actual width, height
                    if (j === 0) {
                        imageResource.width = alignedWidth;
                        imageResource.height = alignedHeight;
                    }
                    var imageBuffer = new Uint8Array(byteSize);
                    if (!basisFile.transcodeImage(imageBuffer, i, 0, format, false, false)) {
                        if (fallbackMode) {
                            // We failed in fallback mode as well!
                            console.error("Basis failed to transcode image " + i + ", level " + 0 + "!");
                            return { type: 'transcode', requestID: message.requestID, success: false };
                        }
                        /* eslint-disable-next-line max-len */
                        console.warn("Basis failed to transcode image " + i + ", level " + 0 + "! Retrying to an uncompressed texture format!");
                        i = -1;
                        fallbackMode = true;
                        break;
                    }
                    imageResource.levelArray.push({
                        levelID: j,
                        levelWidth: width,
                        levelHeight: height,
                        levelBuffer: imageBuffer
                    });
                }
                imageArray[i] = imageResource;
            }
            basisFile.close();
            basisFile.delete();
            return {
                type: 'transcode',
                requestID: message.requestID,
                success: true,
                basisFormat: !fallbackMode ? basisFormat : basisFallbackFormat,
                imageArray: imageArray
            };
        }
    };
    self.onmessage = function (e) {
        var msg = e.data;
        var response = messageHandlers[msg.type](msg);
        if (response) {
            self.postMessage(response);
        }
    };
}

/**
 * Worker class for transcoding *.basis files in background threads.
 *
 * To enable asynchronous transcoding, you need to provide the URL to the basis_universal transcoding
 * library.
 *
 * @memberof PIXI.BasisLoader
 */
var TranscoderWorker = /** @class */ (function () {
    function TranscoderWorker() {
        var _this = this;
        this.requests = {};
        /**
         * Handles responses from the web-worker
         *
         * @param e
         */
        this.onMessage = function (e) {
            var data = e.data;
            if (data.type === 'init') {
                if (!data.success) {
                    throw new Error('BasisResource.TranscoderWorker failed to initialize.');
                }
                _this.isInit = true;
                _this.onInit();
            }
            else if (data.type === 'transcode') {
                --_this.load;
                var requestID = data.requestID;
                if (data.success) {
                    _this.requests[requestID].resolve(data);
                }
                else {
                    _this.requests[requestID].reject();
                }
                delete _this.requests[requestID];
            }
        };
        this.isInit = false;
        this.load = 0;
        this.initPromise = new Promise(function (resolve) { _this.onInit = resolve; });
        if (!TranscoderWorker.wasmSource) {
            console.warn('PIXI.resources.BasisResource.TranscoderWorker has not been given the transcoder WASM binary!');
        }
        this.worker = new Worker(TranscoderWorker.workerURL);
        this.worker.onmessage = this.onMessage;
        this.worker.postMessage({
            type: 'init',
            jsSource: TranscoderWorker.jsSource,
            wasmSource: TranscoderWorker.wasmSource
        });
    }
    Object.defineProperty(TranscoderWorker, "workerURL", {
        /**
         * Generated URL for the transcoder worker script.
         */
        get: function () {
            if (!TranscoderWorker._workerURL) {
                var workerSource = TranscoderWorkerWrapper.toString();
                var beginIndex = workerSource.indexOf('{');
                var endIndex = workerSource.lastIndexOf('}');
                workerSource = workerSource.slice(beginIndex + 1, endIndex);
                if (TranscoderWorker.jsSource) {
                    workerSource = TranscoderWorker.jsSource + "\n" + workerSource;
                }
                TranscoderWorker._workerURL = URL.createObjectURL(new Blob([workerSource]));
            }
            return TranscoderWorker._workerURL;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @returns a promise that is resolved when the web-worker is initialized
     */
    TranscoderWorker.prototype.initAsync = function () {
        return this.initPromise;
    };
    /**
     * @param basisData - *.basis file contents
     * @param rgbaFormat - transcoding format for RGBA files
     * @param rgbFormat - transcoding format for RGB files
     * @returns a promise that is resolved with the transcoding response of the web-worker
     */
    TranscoderWorker.prototype.transcodeAsync = function (basisData, rgbaFormat, rgbFormat) {
        return __awaiter(this, void 0, Promise, function () {
            var requestID, requestPromise;
            var _this = this;
            return __generator(this, function (_a) {
                ++this.load;
                requestID = TranscoderWorker._tempID++;
                requestPromise = new Promise(function (resolve, reject) {
                    _this.requests[requestID] = {
                        resolve: resolve,
                        reject: reject
                    };
                });
                this.worker.postMessage({
                    requestID: requestID,
                    basisData: basisData,
                    rgbaFormat: rgbaFormat,
                    rgbFormat: rgbFormat,
                    type: 'transcode'
                });
                return [2 /*return*/, requestPromise];
            });
        });
    };
    /**
     * Loads the transcoder source code
     *
     * @param jsURL
     * @param wasmURL
     */
    TranscoderWorker.loadTranscoder = function (jsURL, wasmURL) {
        var jsPromise = fetch(jsURL)
            .then(function (res) { return res.text(); })
            .then(function (text) { TranscoderWorker.jsSource = text; });
        var wasmPromise = fetch(wasmURL)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (arrayBuffer) { TranscoderWorker.wasmSource = arrayBuffer; });
        return Promise.all([jsPromise, wasmPromise]).then(function (data) {
            TranscoderWorker.onTranscoderInitialized.emit();
            return data;
        });
    };
    /**
     * Set the transcoder source code directly
     *
     * @param jsSource
     * @param wasmSource
     */
    TranscoderWorker.setTranscoder = function (jsSource, wasmSource) {
        TranscoderWorker.jsSource = jsSource;
        TranscoderWorker.wasmSource = wasmSource;
    };
    TranscoderWorker.onTranscoderInitialized = new runner.Runner('onTranscoderInitialized');
    TranscoderWorker._tempID = 0;
    return TranscoderWorker;
}());

loaders.LoaderResource.setExtensionXhrType('basis', loaders.LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
/**
 * Loader plugin for handling BASIS supercompressed texture files.
 *
 * To use this loader, you must bind the basis_universal WebAssembly transcoder. There are two ways of
 * doing this:
 *
 * 1. Adding a &lt;script&gt; tag to your HTML page to the transcoder bundle in this package, and serving
 * the WASM binary from the same location.
 *
 * ```js
 * // Copy ./node_modules/@pixi/basis/assets/basis_.wasm into your assets directory
 * // as well, so it is served from the same folder as the JavaScript!
 * &lt;script src="./node_modules/@pixi/basis/assets/basis_transcoder.js" /&gt;
 * ```
 *
 * NOTE: `basis_transcoder.js` expects the WebAssembly binary to be named `basis_transcoder.wasm`.
 * NOTE-2: This method supports transcoding on the main-thread. Only use this if you have 1 or 2 *.basis
 * files.
 *
 * 2. Loading the transcoder source from a URL.
 *
 * ```js
 * // Use this if you to use the default CDN url for @pixi/basis
 * BasisLoader.loadTranscoder();
 *
 * // Use this if you want to serve the transcoder on your own
 * BasisLoader.loadTranscoder('./basis_transcoder.js', './basis_transcoder.wasm');
 * ```
 *
 * NOTE: This can only be used with web-workers.
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
var BasisLoader = /** @class */ (function () {
    function BasisLoader() {
    }
    /**
     * Transcodes the *.basis data when the data is loaded. If the transcoder is not bound yet, it
     * will hook transcoding to {@link BasisResource#onTranscoderInitialized}.
     *
     * @param resource
     * @param next
     */
    BasisLoader.use = function (resource, next) {
        if (resource.extension === 'basis' && resource.data) {
            if (!!BasisLoader.basisBinding || (!!BasisLoader.TranscoderWorker.wasmSource)) {
                BasisLoader.transcode(resource, next);
            }
            else {
                TranscoderWorker.onTranscoderInitialized.add(function () {
                    BasisLoader.transcode(resource, next);
                });
            }
        }
        else {
            next();
        }
    };
    /**
     * Runs transcoding and populates {@link imageArray}. It will run the transcoding in a web worker
     * if they are available.
     *
     * @private
     */
    BasisLoader.transcode = function (resource, next) {
        return __awaiter(this, void 0, Promise, function () {
            var data, resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = resource.data;
                        if (!(typeof Worker !== 'undefined' && BasisLoader.TranscoderWorker.wasmSource)) { return [3 /*break*/, 2]; }
                        return [4 /*yield*/, BasisLoader.transcodeAsync(data)];
                    case 1:
                        resources = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        resources = BasisLoader.transcodeSync(data);
                        _a.label = 3;
                    case 3:
                        BasisLoader.registerTextures(resource.url, resources);
                        next();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {string} url
     * @param {TranscodedResourcesArray} resources
     * @private
     */
    BasisLoader.registerTextures = function (url, resources) {
        if (!resources) {
            return;
        }
        // Should be a valid TYPES, FORMATS for uncompressed basis formats
        var type = BASIS_FORMAT_TO_TYPE[resources.basisFormat];
        var format = resources.basisFormat !== exports.BASIS_FORMATS.cTFRGBA32 ? constants.FORMATS.RGB : constants.FORMATS.RGBA;
        resources.forEach(function (resource, i) {
            var baseTexture = new core.BaseTexture(resource, {
                mipmap: constants.MIPMAP_MODES.OFF,
                alphaMode: constants.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
                type: type,
                format: format
            });
            var cacheID = url + "-" + (i + 1);
            core.BaseTexture.addToCache(baseTexture, cacheID);
            core.Texture.addToCache(new core.Texture(baseTexture), cacheID);
            if (i === 0) {
                core.BaseTexture.addToCache(baseTexture, url);
                core.Texture.addToCache(new core.Texture(baseTexture), url);
            }
        });
    };
    /**
     * Finds a suitable worker for transcoding and sends a transcoding request
     *
     * @private
     * @async
     */
    BasisLoader.transcodeAsync = function (arrayBuffer) {
        return __awaiter(this, void 0, Promise, function () {
            var workerPool, leastLoad, worker, i, j, response, basisFormat, imageArray, fallbackMode, imageResources, format, i, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workerPool = BasisLoader.workerPool;
                        leastLoad = 0x10000000;
                        worker = null;
                        for (i = 0, j = workerPool.length; i < j; i++) {
                            if (workerPool[i].load < leastLoad) {
                                worker = workerPool[i];
                                leastLoad = worker.load;
                            }
                        }
                        if (!worker) {
                            /* eslint-disable-next-line no-use-before-define */
                            worker = new TranscoderWorker();
                            workerPool.push(worker);
                        }
                        // Wait until worker is ready
                        return [4 /*yield*/, worker.initAsync()];
                    case 1:
                        // Wait until worker is ready
                        _a.sent();
                        return [4 /*yield*/, worker.transcodeAsync(new Uint8Array(arrayBuffer), BasisLoader.defaultRGBAFormat.basisFormat, BasisLoader.defaultRGBFormat.basisFormat)];
                    case 2:
                        response = _a.sent();
                        basisFormat = response.basisFormat;
                        imageArray = response.imageArray;
                        fallbackMode = basisFormat > 12;
                        if (!fallbackMode) {
                            format = BASIS_FORMAT_TO_INTERNAL_FORMAT[response.basisFormat];
                            // HINT: this.imageArray is CompressedTextureResource[]
                            imageResources = new Array(imageArray.length);
                            for (i = 0, j = imageArray.length; i < j; i++) {
                                imageResources[i] = new compressedTextures.CompressedTextureResource(null, {
                                    format: format,
                                    width: imageArray[i].width,
                                    height: imageArray[i].height,
                                    levelBuffers: imageArray[i].levelArray,
                                    levels: imageArray[i].levelArray.length
                                });
                            }
                        }
                        else {
                            // TODO: BufferResource does not support manual mipmapping.
                            imageResources = imageArray.map(function (image) { return new core.BufferResource(new Uint16Array(image.levelArray[0].levelBuffer.buffer), {
                                width: image.width,
                                height: image.height
                            }); });
                        }
                        imageResources.basisFormat = basisFormat;
                        return [2 /*return*/, imageResources];
                }
            });
        });
    };
    /**
     * Runs transcoding on the main thread.
     *
     * @private
     */
    BasisLoader.transcodeSync = function (arrayBuffer) {
        var BASIS = BasisLoader.basisBinding;
        var data = new Uint8Array(arrayBuffer);
        var basisFile = new BASIS.BasisFile(data);
        var imageCount = basisFile.getNumImages();
        var hasAlpha = basisFile.getHasAlpha();
        var basisFormat = hasAlpha
            ? BasisLoader.defaultRGBAFormat.basisFormat
            : BasisLoader.defaultRGBFormat.basisFormat;
        var basisFallbackFormat = exports.BASIS_FORMATS.cTFRGB565;
        var imageResources = new Array(imageCount);
        var fallbackMode = BasisLoader.fallbackMode;
        if (!basisFile.startTranscoding()) {
            console.error("Basis failed to start transcoding!");
            basisFile.close();
            basisFile.delete();
            return null;
        }
        for (var i = 0; i < imageCount; i++) {
            // Don't transcode all mipmap levels in fallback mode!
            var levels = !fallbackMode ? basisFile.getNumLevels(i) : 1;
            var width = basisFile.getImageWidth(i, 0);
            var height = basisFile.getImageHeight(i, 0);
            var alignedWidth = (width + 3) & ~3;
            var alignedHeight = (height + 3) & ~3;
            var imageLevels = new Array(levels);
            // Transcode mipmap levels into "imageLevels"
            for (var j = 0; j < levels; j++) {
                var levelWidth = basisFile.getImageWidth(i, j);
                var levelHeight = basisFile.getImageHeight(i, j);
                var byteSize = basisFile.getImageTranscodedSizeInBytes(i, 0, !fallbackMode ? basisFormat : basisFallbackFormat);
                imageLevels[j] = {
                    levelBuffer: new Uint8Array(byteSize),
                    levelWidth: levelWidth,
                    levelHeight: levelHeight,
                };
                if (!basisFile.transcodeImage(imageLevels[j].levelBuffer, i, 0, !fallbackMode ? basisFormat : basisFallbackFormat, false, false)) {
                    if (fallbackMode) {
                        console.error("Basis failed to transcode image " + i + ", level " + 0 + "!");
                        break;
                    }
                    else {
                        // Try transcoding to an uncompressed format before giving up!
                        // NOTE: We must start all over again as all Resources must be in compressed OR uncompressed.
                        i = -1;
                        fallbackMode = true;
                        /* eslint-disable-next-line max-len */
                        console.warn("Basis failed to transcode image " + i + ", level " + 0 + " to a compressed texture format. Retrying to an uncompressed fallback format!");
                        continue;
                    }
                }
            }
            var imageResource = void 0;
            if (!fallbackMode) {
                imageResource = new compressedTextures.CompressedTextureResource(null, {
                    format: BASIS_FORMAT_TO_INTERNAL_FORMAT[basisFormat],
                    width: alignedWidth,
                    height: alignedHeight,
                    levelBuffers: imageLevels,
                    levels: levels
                });
            }
            else {
                // TODO: BufferResource doesn't support manual mipmap levels
                imageResource = new core.BufferResource(new Uint16Array(imageLevels[0].levelBuffer.buffer), { width: width, height: height });
            }
            imageResources[i] = imageResource;
        }
        basisFile.close();
        basisFile.delete();
        var transcodedResources = imageResources;
        transcodedResources.basisFormat = !fallbackMode ? basisFormat : basisFallbackFormat;
        return transcodedResources;
    };
    /**
     * Detects the available compressed texture formats on the device.
     *
     * @param extensions - extensions provided by a WebGL context
     * @ignore
     */
    BasisLoader.autoDetectFormats = function (extensions) {
        // Auto-detect WebGL compressed-texture extensions
        if (!extensions) {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl');
            if (!gl) {
                console.error('WebGL not available for BASIS transcoding. Silently failing.');
                return;
            }
            extensions = {
                s3tc: gl.getExtension('WEBGL_compressed_texture_s3tc'),
                s3tc_sRGB: gl.getExtension('WEBGL_compressed_texture_s3tc_srgb'),
                etc: gl.getExtension('WEBGL_compressed_texture_etc'),
                etc1: gl.getExtension('WEBGL_compressed_texture_etc1'),
                pvrtc: gl.getExtension('WEBGL_compressed_texture_pvrtc')
                    || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
                atc: gl.getExtension('WEBGL_compressed_texture_atc'),
                astc: gl.getExtension('WEBGL_compressed_texture_astc')
            };
        }
        // Discover the available texture formats
        var supportedFormats = {};
        for (var key in extensions) {
            var extension = extensions[key];
            if (!extension) {
                continue;
            }
            Object.assign(supportedFormats, Object.getPrototypeOf(extension));
        }
        // Set the default alpha/non-alpha output formats for basisu transcoding
        for (var i = 0; i < 2; i++) {
            var detectWithAlpha = !!i;
            var internalFormat = void 0;
            var basisFormat = void 0;
            for (var id in supportedFormats) {
                internalFormat = supportedFormats[id];
                basisFormat = INTERNAL_FORMAT_TO_BASIS_FORMAT[internalFormat];
                if (basisFormat !== undefined) {
                    if ((detectWithAlpha && BASIS_FORMATS_ALPHA[basisFormat])
                        || (!detectWithAlpha && !BASIS_FORMATS_ALPHA[basisFormat])) {
                        break;
                    }
                }
            }
            if (internalFormat) {
                BasisLoader[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: internalFormat,
                    basisFormat: basisFormat,
                };
            }
            else {
                BasisLoader[detectWithAlpha ? 'defaultRGBAFormat' : 'defaultRGBFormat'] = {
                    textureFormat: constants.TYPES.UNSIGNED_SHORT_5_6_5,
                    basisFormat: exports.BASIS_FORMATS.cTFRGB565
                };
                BasisLoader.fallbackMode = true;
            }
        }
    };
    /**
     * Binds the basis_universal transcoder to decompress *.basis files. You must initialize the transcoder library yourself.
     *
     * ```js
     * import { BasisLoader } from '@pixi/basis';
     * import { Loader } from '@pixi/loaders';
     *
     * // window.BASIS() returns a Promise-like object
     * window.BASIS().then((basisLibrary) =>
     * {
     *     // Initialize basis-library; otherwise, transcoded results maybe corrupt!
     *     basisLibrary.initializeBasis();
     *
     *     // Bind BasisLoader to the transcoder
     *     BasisLoader.bindTranscoder(basisLibrary);
     * });
     * ```
     *
     * @param basisu - the initialized transcoder library
     * @private
     */
    BasisLoader.bindTranscoder = function (basisLibrary) {
        BasisLoader.basisBinding = basisLibrary;
    };
    /**
     * Loads the transcoder source code for use in {@link PIXI.BasisLoader.TranscoderWorker}.
     *
     * @param jsURL
     * @param wasmURL
     * @private
     */
    BasisLoader.loadTranscoder = function (jsURL, wasmURL) {
        return BasisLoader.TranscoderWorker.loadTranscoder(jsURL, wasmURL);
    };
    /**
     * Set the transcoder source code directly
     *
     * @param jsSource
     * @param wasmSource
     * @private
     */
    BasisLoader.setTranscoder = function (jsSource, wasmSource) {
        BasisLoader.TranscoderWorker.setTranscoder(jsSource, wasmSource);
    };
    Object.defineProperty(BasisLoader, "TRANSCODER_WORKER_POOL_LIMIT", {
        get: function () {
            return this.workerPool.length || 1;
        },
        set: function (limit) {
            // TODO: Destroy workers?
            for (var i = this.workerPool.length; i < limit; i++) {
                this.workerPool[i] = new TranscoderWorker();
                this.workerPool[i].initAsync();
            }
        },
        enumerable: false,
        configurable: true
    });
    BasisLoader.fallbackMode = false;
    BasisLoader.workerPool = [];
    BasisLoader.TranscoderWorker = TranscoderWorker;
    return BasisLoader;
}());
// Auto-detect compressed texture formats once @pixi/basis is imported!
BasisLoader.autoDetectFormats();

// parse any BASIS supercompressed files into textures
loaders.Loader.registerPlugin(BasisLoader);

exports.BASIS_FORMATS_ALPHA = BASIS_FORMATS_ALPHA;
exports.BASIS_FORMAT_TO_INTERNAL_FORMAT = BASIS_FORMAT_TO_INTERNAL_FORMAT;
exports.BASIS_FORMAT_TO_TYPE = BASIS_FORMAT_TO_TYPE;
exports.BasisLoader = BasisLoader;
exports.INTERNAL_FORMAT_TO_BASIS_FORMAT = INTERNAL_FORMAT_TO_BASIS_FORMAT;
//# sourceMappingURL=basis.js.map
