/*!
 * @pixi/filter-noise - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/filter-noise is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var fragment = "precision highp float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float uNoise;\nuniform float uSeed;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float randomValue = rand(gl_FragCoord.xy * uSeed);\n    float diff = (randomValue - 0.5) * uNoise;\n\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\n    if (color.a > 0.0) {\n        color.rgb /= color.a;\n    }\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    // Premultiply alpha again.\n    color.rgb *= color.a;\n\n    gl_FragColor = color;\n}\n";

/**
 * A Noise effect filter.
 *
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/noise.js
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @author Vico @vicocotea
 */
var NoiseFilter = /** @class */ (function (_super) {
    __extends(NoiseFilter, _super);
    /**
     * @param {number} [noise=0.5] - The noise intensity, should be a normalized value in the range [0, 1].
     * @param {number} [seed] - A random seed for the noise generation. Default is `Math.random()`.
     */
    function NoiseFilter(noise, seed) {
        if (noise === void 0) { noise = 0.5; }
        if (seed === void 0) { seed = Math.random(); }
        var _this = _super.call(this, core.defaultFilterVertex, fragment, {
            uNoise: 0,
            uSeed: 0,
        }) || this;
        _this.noise = noise;
        _this.seed = seed;
        return _this;
    }
    Object.defineProperty(NoiseFilter.prototype, "noise", {
        /**
         * The amount of noise to apply, this value should be in the range (0, 1].
         *
         * @member {number}
         * @default 0.5
         */
        get: function () {
            return this.uniforms.uNoise;
        },
        set: function (value) {
            this.uniforms.uNoise = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NoiseFilter.prototype, "seed", {
        /**
         * A seed value to apply to the random noise generation. `Math.random()` is a good value to use.
         *
         * @member {number}
         */
        get: function () {
            return this.uniforms.uSeed;
        },
        set: function (value) {
            this.uniforms.uSeed = value;
        },
        enumerable: false,
        configurable: true
    });
    return NoiseFilter;
}(core.Filter));

exports.NoiseFilter = NoiseFilter;
//# sourceMappingURL=filter-noise.js.map
