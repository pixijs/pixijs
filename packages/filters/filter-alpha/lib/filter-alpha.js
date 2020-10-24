/*!
 * @pixi/filter-alpha - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/filter-alpha is licensed under the MIT License.
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

var fragment = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float uAlpha;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;\n}\n";

/**
 * Simplest filter - applies alpha.
 *
 * Use this instead of Container's alpha property to avoid visual layering of individual elements.
 * AlphaFilter applies alpha evenly across the entire display object and any opaque elements it contains.
 * If elements are not opaque, they will blend with each other anyway.
 *
 * Very handy if you want to use common features of all filters:
 *
 * 1. Assign a blendMode to this filter, blend all elements inside display object with background.
 *
 * 2. To use clipping in display coordinates, assign a filterArea to the same container that has this filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var AlphaFilter = /** @class */ (function (_super) {
    __extends(AlphaFilter, _super);
    /**
     * @param {number} [alpha=1] - Amount of alpha from 0 to 1, where 0 is transparent
     */
    function AlphaFilter(alpha) {
        if (alpha === void 0) { alpha = 1.0; }
        var _this = _super.call(this, core.defaultVertex, fragment, { uAlpha: 1 }) || this;
        _this.alpha = alpha;
        return _this;
    }
    Object.defineProperty(AlphaFilter.prototype, "alpha", {
        /**
         * Coefficient for alpha multiplication
         *
         * @member {number}
         * @default 1
         */
        get: function () {
            return this.uniforms.uAlpha;
        },
        set: function (value) {
            this.uniforms.uAlpha = value;
        },
        enumerable: false,
        configurable: true
    });
    return AlphaFilter;
}(core.Filter));

exports.AlphaFilter = AlphaFilter;
//# sourceMappingURL=filter-alpha.js.map
