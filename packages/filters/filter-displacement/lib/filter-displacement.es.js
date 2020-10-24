/*!
 * @pixi/filter-displacement - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/filter-displacement is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Filter } from '@pixi/core';
import { Matrix, Point } from '@pixi/math';

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

var fragment = "varying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\nuniform mat2 rotation;\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform highp vec4 inputSize;\nuniform vec4 inputClamp;\n\nvoid main(void)\n{\n  vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n  map -= 0.5;\n  map.xy = scale * inputSize.zw * (rotation * map.xy);\n\n  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));\n}\n";

var vertex = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n\tgl_Position = filterVertexPosition();\n\tvTextureCoord = filterTextureCoord();\n\tvFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;\n}\n";

/**
 * The DisplacementFilter class uses the pixel values from the specified texture
 * (called the displacement map) to perform a displacement of an object.
 *
 * You can use this filter to apply all manor of crazy warping effects.
 * Currently the `r` property of the texture is used to offset the `x`
 * and the `g` property of the texture is used to offset the `y`.
 *
 * The way it works is it uses the values of the displacement map to look up the
 * correct pixels to output. This means it's not technically moving the original.
 * Instead, it's starting at the output and asking "which pixel from the original goes here".
 * For example, if a displacement map pixel has `red = 1` and the filter scale is `20`,
 * this filter will output the pixel approximately 20 pixels to the right of the original.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var DisplacementFilter = /** @class */ (function (_super) {
    __extends(DisplacementFilter, _super);
    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param {number} [scale] - The scale of the displacement
     */
    function DisplacementFilter(sprite, scale) {
        var _this = this;
        var maskMatrix = new Matrix();
        sprite.renderable = false;
        _this = _super.call(this, vertex, fragment, {
            mapSampler: sprite._texture,
            filterMatrix: maskMatrix,
            scale: { x: 1, y: 1 },
            rotation: new Float32Array([1, 0, 0, 1]),
        }) || this;
        _this.maskSprite = sprite;
        _this.maskMatrix = maskMatrix;
        if (scale === null || scale === undefined) {
            scale = 20;
        }
        /**
         * scaleX, scaleY for displacements
         * @member {PIXI.Point}
         */
        _this.scale = new Point(scale, scale);
        return _this;
    }
    /**
     * Applies the filter.
     *
     * @param {PIXI.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - clearMode.
     */
    DisplacementFilter.prototype.apply = function (filterManager, input, output, clearMode) {
        // fill maskMatrix with _normalized sprite texture coords_
        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x;
        this.uniforms.scale.y = this.scale.y;
        // Extract rotation from world transform
        var wt = this.maskSprite.worldTransform;
        var lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        var lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));
        if (lenX !== 0 && lenY !== 0) {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }
        // draw the filter...
        filterManager.applyFilter(this, input, output, clearMode);
    };
    Object.defineProperty(DisplacementFilter.prototype, "map", {
        /**
         * The texture used for the displacement map. Must be power of 2 sized texture.
         *
         * @member {PIXI.Texture}
         */
        get: function () {
            return this.uniforms.mapSampler;
        },
        set: function (value) {
            this.uniforms.mapSampler = value;
        },
        enumerable: false,
        configurable: true
    });
    return DisplacementFilter;
}(Filter));

export { DisplacementFilter };
//# sourceMappingURL=filter-displacement.es.js.map
