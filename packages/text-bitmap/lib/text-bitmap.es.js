/*!
 * @pixi/text-bitmap - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/text-bitmap is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
import { Rectangle, ObservablePoint, Point } from '@pixi/math';
import { settings } from '@pixi/settings';
import { MeshGeometry, MeshMaterial, Mesh } from '@pixi/mesh';
import { hex2rgb, string2hex, getResolutionOfUrl, deprecation, removeItems } from '@pixi/utils';
import { Texture, BaseTexture } from '@pixi/core';
import { TEXT_GRADIENT, TextStyle, TextMetrics } from '@pixi/text';
import { Container } from '@pixi/display';
import { LoaderResource } from '@pixi/loaders';

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

/* eslint-disable max-len */
/**
 * Normalized parsed data from .fnt files.
 *
 * @class
 * @memberof PIXI
 */
var BitmapFontData = /** @class */ (function () {
    function BitmapFontData() {
        /**
         * @member {PIXI.IBitmapFontDataInfo[]}
         * @readOnly
         */
        this.info = [];
        /**
         * @member {PIXI.IBitmapFontDataCommon[]}
         * @readOnly
         */
        this.common = [];
        /**
         * @member {PIXI.IBitmapFontDataPage[]}
         * @readOnly
         */
        this.page = [];
        /**
         * @member {PIXI.IBitmapFontDataChar[]}
         * @readOnly
         */
        this.char = [];
        /**
         * @member {PIXI.IBitmapFontDataKerning[]}
         * @readOnly
         */
        this.kerning = [];
    }
    return BitmapFontData;
}());
/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataInfo
 * @property {string} face
 * @property {number} size
 */
/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataCommon
 * @property {number} lineHeight
 */
/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataPage
 * @property {number} id
 * @property {string} file
 */
/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataChar
 * @property {string} id
 * @property {number} page
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} xoffset
 * @property {number} yoffset
 * @property {number} xadvance
 */
/**
 * @memberof PIXI
 * @typedef {object} IBitmapFontDataKerning
 * @property {number} first
 * @property {number} second
 * @property {number} amount
 */

/**
 * BitmapFont format that's Text-based.
 *
 * @class
 * @private
 */
var TextFormat = /** @class */ (function () {
    function TextFormat() {
    }
    /**
     * Check if resource refers to txt font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    TextFormat.test = function (data) {
        return typeof data === 'string' && data.indexOf('info face=') === 0;
    };
    /**
     * Convert text font data to a javascript object.
     *
     * @static
     * @private
     * @param {string} txt - Raw string data to be converted
     * @return {PIXI.BitmapFontData} Parsed font data
     */
    TextFormat.parse = function (txt) {
        // Retrieve data item
        var items = txt.match(/^[a-z]+\s+.+$/gm);
        var rawData = {
            info: [],
            common: [],
            page: [],
            char: [],
            chars: [],
            kerning: [],
            kernings: [],
        };
        for (var i in items) {
            // Extract item name
            var name = items[i].match(/^[a-z]+/gm)[0];
            // Extract item attribute list as string ex.: "width=10"
            var attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);
            // Convert attribute list into an object
            var itemData = {};
            for (var i_1 in attributeList) {
                // Split key-value pairs
                var split = attributeList[i_1].split('=');
                var key = split[0];
                // Remove eventual quotes from value
                var strValue = split[1].replace(/"/gm, '');
                // Try to convert value into float
                var floatValue = parseFloat(strValue);
                // Use string value case float value is NaN
                var value = isNaN(floatValue) ? strValue : floatValue;
                itemData[key] = value;
            }
            // Push current item to the resulting data
            rawData[name].push(itemData);
        }
        var font = new BitmapFontData();
        rawData.info.forEach(function (info) { return font.info.push({
            face: info.face,
            size: parseInt(info.size, 10),
        }); });
        rawData.common.forEach(function (common) { return font.common.push({
            lineHeight: parseInt(common.lineHeight, 10),
        }); });
        rawData.page.forEach(function (page) { return font.page.push({
            id: parseInt(page.id, 10),
            file: page.file,
        }); });
        rawData.char.forEach(function (char) { return font.char.push({
            id: parseInt(char.id, 10),
            page: parseInt(char.page, 10),
            x: parseInt(char.x, 10),
            y: parseInt(char.y, 10),
            width: parseInt(char.width, 10),
            height: parseInt(char.height, 10),
            xoffset: parseInt(char.xoffset, 10),
            yoffset: parseInt(char.yoffset, 10),
            xadvance: parseInt(char.xadvance, 10),
        }); });
        rawData.kerning.forEach(function (kerning) { return font.kerning.push({
            first: parseInt(kerning.first, 10),
            second: parseInt(kerning.second, 10),
            amount: parseInt(kerning.amount, 10),
        }); });
        return font;
    };
    return TextFormat;
}());

/**
 * BitmapFont format that's XML-based.
 *
 * @class
 * @private
 */
var XMLFormat = /** @class */ (function () {
    function XMLFormat() {
    }
    /**
     * Check if resource refers to xml font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    XMLFormat.test = function (data) {
        return data instanceof XMLDocument
            && data.getElementsByTagName('page').length
            && data.getElementsByTagName('info')[0].getAttribute('face') !== null;
    };
    /**
     * Convert the XML into BitmapFontData that we can use.
     *
     * @static
     * @private
     * @param {XMLDocument} xml
     * @return {BitmapFontData} Data to use for BitmapFont
     */
    XMLFormat.parse = function (xml) {
        var data = new BitmapFontData();
        var info = xml.getElementsByTagName('info');
        var common = xml.getElementsByTagName('common');
        var page = xml.getElementsByTagName('page');
        var char = xml.getElementsByTagName('char');
        var kerning = xml.getElementsByTagName('kerning');
        for (var i = 0; i < info.length; i++) {
            data.info.push({
                face: info[i].getAttribute('face'),
                size: parseInt(info[i].getAttribute('size'), 10),
            });
        }
        for (var i = 0; i < common.length; i++) {
            data.common.push({
                lineHeight: parseInt(common[i].getAttribute('lineHeight'), 10),
            });
        }
        for (var i = 0; i < page.length; i++) {
            data.page.push({
                id: parseInt(page[i].getAttribute('id'), 10) || 0,
                file: page[i].getAttribute('file'),
            });
        }
        for (var i = 0; i < char.length; i++) {
            var letter = char[i];
            data.char.push({
                id: parseInt(letter.getAttribute('id'), 10),
                page: parseInt(letter.getAttribute('page'), 10) || 0,
                x: parseInt(letter.getAttribute('x'), 10),
                y: parseInt(letter.getAttribute('y'), 10),
                width: parseInt(letter.getAttribute('width'), 10),
                height: parseInt(letter.getAttribute('height'), 10),
                xoffset: parseInt(letter.getAttribute('xoffset'), 10),
                yoffset: parseInt(letter.getAttribute('yoffset'), 10),
                xadvance: parseInt(letter.getAttribute('xadvance'), 10),
            });
        }
        for (var i = 0; i < kerning.length; i++) {
            data.kerning.push({
                first: parseInt(kerning[i].getAttribute('first'), 10),
                second: parseInt(kerning[i].getAttribute('second'), 10),
                amount: parseInt(kerning[i].getAttribute('amount'), 10),
            });
        }
        return data;
    };
    return XMLFormat;
}());

/**
 * BitmapFont format that's XML-based.
 *
 * @class
 * @private
 */
var XMLStringFormat = /** @class */ (function () {
    function XMLStringFormat() {
    }
    /**
     * Check if resource refers to text xml font data.
     *
     * @static
     * @private
     * @param {any} data
     * @return {boolean} True if resource could be treated as font data, false otherwise.
     */
    XMLStringFormat.test = function (data) {
        var xmlStringRegExp = new RegExp(/<font>(\s+)?<info\s+face=/);
        return typeof data === 'string' && xmlStringRegExp.test(data);
    };
    /**
     * Convert the text XML into BitmapFontData that we can use.
     *
     * @static
     * @private
     * @param {string} xmlTxt
     * @return {BitmapFontData} Data to use for BitmapFont
     */
    XMLStringFormat.parse = function (xmlTxt) {
        var xml = new window.DOMParser().parseFromString(xmlTxt, 'text/xml');
        return XMLFormat.parse(xml);
    };
    return XMLStringFormat;
}());

// Registered formats, maybe make this extensible in the future?
var formats = [
    TextFormat,
    XMLFormat,
    XMLStringFormat ];
/**
 * Auto-detect BitmapFont parsing format based on data.
 * @private
 * @param {any} data - Data to detect format
 * @return {any} Format or null
 */
function autoDetectFormat(data) {
    for (var i = 0; i < formats.length; i++) {
        if (formats[i].test(data)) {
            return formats[i];
        }
    }
    return null;
}

// TODO: Prevent code duplication b/w generateFillStyle & Text#generateFillStyle
/**
 * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
 *
 * @private
 * @param {object} style - The style.
 * @param {string[]} lines - The lines of text.
 * @return {string|number|CanvasGradient} The fill style
 */
function generateFillStyle(canvas, context, style, resolution, lines, metrics) {
    // TODO: Can't have different types for getter and setter. The getter shouldn't have the number type as
    //       the setter converts to string. See this thread for more details:
    //       https://github.com/microsoft/TypeScript/issues/2521
    var fillStyle = style.fill;
    if (!Array.isArray(fillStyle)) {
        return fillStyle;
    }
    else if (fillStyle.length === 1) {
        return fillStyle[0];
    }
    // the gradient will be evenly spaced out according to how large the array is.
    // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
    var gradient;
    // a dropshadow will enlarge the canvas and result in the gradient being
    // generated with the incorrect dimensions
    var dropShadowCorrection = (style.dropShadow) ? style.dropShadowDistance : 0;
    // should also take padding into account, padding can offset the gradient
    var padding = style.padding || 0;
    var width = Math.ceil(canvas.width / resolution) - dropShadowCorrection - (padding * 2);
    var height = Math.ceil(canvas.height / resolution) - dropShadowCorrection - (padding * 2);
    // make a copy of the style settings, so we can manipulate them later
    var fill = fillStyle.slice();
    var fillGradientStops = style.fillGradientStops.slice();
    // wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
    if (!fillGradientStops.length) {
        var lengthPlus1 = fill.length + 1;
        for (var i = 1; i < lengthPlus1; ++i) {
            fillGradientStops.push(i / lengthPlus1);
        }
    }
    // stop the bleeding of the last gradient on the line above to the top gradient of the this line
    // by hard defining the first gradient colour at point 0, and last gradient colour at point 1
    fill.unshift(fillStyle[0]);
    fillGradientStops.unshift(0);
    fill.push(fillStyle[fillStyle.length - 1]);
    fillGradientStops.push(1);
    if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
        // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
        gradient = context.createLinearGradient(width / 2, padding, width / 2, height + padding);
        // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
        // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
        // There's potential for floating point precision issues at the seams between gradient repeats.
        // The loop below generates the stops in order, so track the last generated one to prevent
        // floating point precision from making us go the teeniest bit backwards, resulting in
        // the first and last colors getting swapped.
        var lastIterationStop = 0;
        // Actual height of the text itself, not counting spacing for lineHeight/leading/dropShadow etc
        var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
        // textHeight, but as a 0-1 size in global gradient stop space
        var gradStopLineHeight = textHeight / height;
        for (var i = 0; i < lines.length; i++) {
            var thisLineTop = metrics.lineHeight * i;
            for (var j = 0; j < fill.length; j++) {
                // 0-1 stop point for the current line, multiplied to global space afterwards
                var lineStop = 0;
                if (typeof fillGradientStops[j] === 'number') {
                    lineStop = fillGradientStops[j];
                }
                else {
                    lineStop = j / fill.length;
                }
                var globalStop = (thisLineTop / height) + (lineStop * gradStopLineHeight);
                // Prevent color stop generation going backwards from floating point imprecision
                var clampedStop = Math.max(lastIterationStop, globalStop);
                clampedStop = Math.min(clampedStop, 1); // Cap at 1 as well for safety's sake to avoid a possible throw.
                gradient.addColorStop(clampedStop, fill[j]);
                lastIterationStop = clampedStop;
            }
        }
    }
    else {
        // start the gradient at the center left of the canvas, and end at the center right of the canvas
        gradient = context.createLinearGradient(padding, height / 2, width + padding, height / 2);
        // can just evenly space out the gradients in this case, as multiple lines makes no difference
        // to an even left to right gradient
        var totalIterations = fill.length + 1;
        var currentIteration = 1;
        for (var i = 0; i < fill.length; i++) {
            var stop = void 0;
            if (typeof fillGradientStops[i] === 'number') {
                stop = fillGradientStops[i];
            }
            else {
                stop = currentIteration / totalIterations;
            }
            gradient.addColorStop(stop, fill[i]);
            currentIteration++;
        }
    }
    return gradient;
}

// TODO: Prevent code duplication b/w drawGlyph & Text#updateText
/**
 * Draws the glyph `metrics.text` on the given canvas.
 *
 * Ignored because not directly exposed.
 *
 * @ignore
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @param {TextMetrics} metrics
 * @param {number} x
 * @param {number} y
 * @param {number} resolution
 * @param {TextStyle} style
 */
function drawGlyph(canvas, context, metrics, x, y, resolution, style) {
    var char = metrics.text;
    var fontProperties = metrics.fontProperties;
    context.translate(x, y);
    context.scale(resolution, resolution);
    var tx = style.strokeThickness / 2;
    var ty = -(style.strokeThickness / 2);
    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;
    // set canvas text styles
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke;
    context.font = style.toFontString();
    context.lineWidth = style.strokeThickness;
    context.textBaseline = style.textBaseline;
    context.lineJoin = style.lineJoin;
    context.miterLimit = style.miterLimit;
    // set canvas text styles
    context.fillStyle = generateFillStyle(canvas, context, style, resolution, [char], metrics);
    context.strokeStyle = style.stroke;
    var dropShadowColor = style.dropShadowColor;
    var rgb = hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : string2hex(dropShadowColor));
    if (style.dropShadow) {
        context.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
        context.shadowBlur = style.dropShadowBlur;
        context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        context.shadowOffsetY = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
    }
    else {
        context.shadowColor = '0';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }
    if (style.stroke && style.strokeThickness) {
        context.strokeText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }
    if (style.fill) {
        context.fillText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
    }
    context.setTransform(1, 0, 0, 1, 0, 0); // defaults needed for older browsers (e.g. Opera 29)
    context.fillStyle = 'rgba(0, 0, 0, 0)';
}

/**
 * Processes the passed character set data and returns a flattened array of all the characters.
 *
 * Ignored because not directly exposed.
 *
 * @ignore
 * @param {string | string[] | string[][] } chars
 * @returns {string[]}
 */
function resolveCharacters(chars) {
    // Split the chars string into individual characters
    if (typeof chars === 'string') {
        chars = [chars];
    }
    // Handle an array of characters+ranges
    var result = [];
    for (var i = 0, j = chars.length; i < j; i++) {
        var item = chars[i];
        // Handle range delimited by start/end chars
        if (Array.isArray(item)) {
            if (item.length !== 2) {
                throw new Error("[BitmapFont]: Invalid character range length, expecting 2 got " + item.length + ".");
            }
            var startCode = item[0].charCodeAt(0);
            var endCode = item[1].charCodeAt(0);
            if (endCode < startCode) {
                throw new Error('[BitmapFont]: Invalid character range.');
            }
            for (var i_1 = startCode, j_1 = endCode; i_1 <= j_1; i_1++) {
                result.push(String.fromCharCode(i_1));
            }
        }
        // Handle a character set string
        else {
            result.push.apply(result, item.split(''));
        }
    }
    if (result.length === 0) {
        throw new Error('[BitmapFont]: Empty set when resolving characters.');
    }
    return result;
}

/**
 * BitmapFont represents a typeface available for use with the BitmapText class. Use the `install`
 * method for adding a font to be used.
 *
 * @class
 * @memberof PIXI
 */
var BitmapFont = /** @class */ (function () {
    /**
     * @param {PIXI.BitmapFontData} data
     * @param {PIXI.Texture[]|Object.<string, PIXI.Texture>} textures
     */
    function BitmapFont(data, textures) {
        var info = data.info[0];
        var common = data.common[0];
        var page = data.page[0];
        var res = getResolutionOfUrl(page.file);
        var pageTextures = {};
        /**
         * The name of the font face.
         *
         * @member {string}
         * @readonly
         */
        this.font = info.face;
        /**
         * The size of the font face in pixels.
         *
         * @member {number}
         * @readonly
         */
        this.size = info.size;
        /**
         * The line-height of the font face in pixels.
         *
         * @member {number}
         * @readonly
         */
        this.lineHeight = common.lineHeight / res;
        /**
         * The map of characters by character code.
         *
         * @member {object}
         * @readonly
         */
        this.chars = {};
        /**
         * The map of base page textures (i.e., sheets of glyphs).
         *
         * @member {object}
         * @readonly
         * @private
         */
        this.pageTextures = pageTextures;
        // Convert the input Texture, Textures or object
        // into a page Texture lookup by "id"
        for (var i = 0; i < data.page.length; i++) {
            var _a = data.page[i], id = _a.id, file = _a.file;
            pageTextures[id] = textures instanceof Array
                ? textures[i] : textures[file];
        }
        // parse letters
        for (var i = 0; i < data.char.length; i++) {
            var _b = data.char[i], id = _b.id, page_1 = _b.page;
            var _c = data.char[i], x = _c.x, y = _c.y, width = _c.width, height = _c.height, xoffset = _c.xoffset, yoffset = _c.yoffset, xadvance = _c.xadvance;
            x /= res;
            y /= res;
            width /= res;
            height /= res;
            xoffset /= res;
            yoffset /= res;
            xadvance /= res;
            var rect = new Rectangle(x + (pageTextures[page_1].frame.x / res), y + (pageTextures[page_1].frame.y / res), width, height);
            this.chars[id] = {
                xOffset: xoffset,
                yOffset: yoffset,
                xAdvance: xadvance,
                kerning: {},
                texture: new Texture(pageTextures[page_1].baseTexture, rect),
                page: page_1,
            };
        }
        // parse kernings
        for (var i = 0; i < data.kerning.length; i++) {
            var _d = data.kerning[i], first = _d.first, second = _d.second, amount = _d.amount;
            first /= res;
            second /= res;
            amount /= res;
            if (this.chars[second]) {
                this.chars[second].kerning[first] = amount;
            }
        }
    }
    /**
     * Remove references to created glyph textures.
     */
    BitmapFont.prototype.destroy = function () {
        for (var id in this.chars) {
            this.chars[id].texture.destroy();
            this.chars[id].texture = null;
        }
        for (var id in this.pageTextures) {
            this.pageTextures[id].destroy(true);
            this.pageTextures[id] = null;
        }
        // Set readonly null.
        this.chars = null;
        this.pageTextures = null;
    };
    /**
     * Register a new bitmap font.
     *
     * @static
     * @param {XMLDocument|string|PIXI.BitmapFontData} data - The
     *        characters map that could be provided as xml or raw string.
     * @param {Object.<string, PIXI.Texture>|PIXI.Texture|PIXI.Texture[]}
     *        textures - List of textures for each page.
     * @return {PIXI.BitmapFont} Result font object with font, size, lineHeight
     *         and char fields.
     */
    BitmapFont.install = function (data, textures) {
        var fontData;
        if (data instanceof BitmapFontData) {
            fontData = data;
        }
        else {
            var format = autoDetectFormat(data);
            if (!format) {
                throw new Error('Unrecognized data format for font.');
            }
            fontData = format.parse(data);
        }
        // Single texture, convert to list
        if (textures instanceof Texture) {
            textures = [textures];
        }
        var font = new BitmapFont(fontData, textures);
        BitmapFont.available[font.font] = font;
        return font;
    };
    /**
     * Remove bitmap font by name.
     *
     * @static
     * @param {string} name
     */
    BitmapFont.uninstall = function (name) {
        var font = BitmapFont.available[name];
        if (!font) {
            throw new Error("No font found named '" + name + "'");
        }
        font.destroy();
        delete BitmapFont.available[name];
    };
    /**
     * Generates a bitmap-font for the given style and character set. This does not support
     * kernings yet. With `style` properties, only the following non-layout properties are used:
     *
     * - {@link PIXI.TextStyle#dropShadow|dropShadow}
     * - {@link PIXI.TextStyle#dropShadowDistance|dropShadowDistance}
     * - {@link PIXI.TextStyle#dropShadowColor|dropShadowColor}
     * - {@link PIXI.TextStyle#dropShadowBlur|dropShadowBlur}
     * - {@link PIXI.TextStyle#dropShadowAngle|dropShadowAngle}
     * - {@link PIXI.TextStyle#fill|fill}
     * - {@link PIXI.TextStyle#fillGradientStops|fillGradientStops}
     * - {@link PIXI.TextStyle#fillGradientType|fillGradientType}
     * - {@link PIXI.TextStyle#fontFamily|fontFamily}
     * - {@link PIXI.TextStyle#fontSize|fontSize}
     * - {@link PIXI.TextStyle#fontVariant|fontVariant}
     * - {@link PIXI.TextStyle#fontWeight|fontWeight}
     * - {@link PIXI.TextStyle#lineJoin|lineJoin}
     * - {@link PIXI.TextStyle#miterLimit|miterLimit}
     * - {@link PIXI.TextStyle#stroke|stroke}
     * - {@link PIXI.TextStyle#strokeThickness|strokeThickness}
     * - {@link PIXI.TextStyle#textBaseline|textBaseline}
     *
     * @param {string} name - The name of the custom font to use with BitmapText.
     * @param {object|PIXI.TextStyle} [style] - Style options to render with BitmapFont.
     * @param {PIXI.IBitmapFontOptions} [options] - Setup options for font or name of the font.
     * @param {string|string[]|string[][]} [options.chars=PIXI.BitmapFont.ALPHANUMERIC] - characters included
     *      in the font set. You can also use ranges. For example, `[['a', 'z'], ['A', 'Z'], "!@#$%^&*()~{}[] "]`.
     *      Don't forget to include spaces ' ' in your character set!
     * @param {number} [options.resolution=1] - Render resolution for glyphs.
     * @param {number} [options.textureWidth=512] - Optional width of atlas, smaller values to reduce memory.
     * @param {number} [options.textureHeight=512] - Optional height of atlas, smaller values to reduce memory.
     * @param {number} [options.padding=4] - Padding between glyphs on texture atlas.
     * @return {PIXI.BitmapFont} Font generated by style options.
     * @static
     * @example
     * PIXI.BitmapFont.from("TitleFont", {
     *     fontFamily: "Arial",
     *     fontSize: 12,
     *     strokeThickness: 2,
     *     fill: "purple"
     * });
     *
     * const title = new PIXI.BitmapText("This is the title", { fontName: "TitleFont" });
     */
    BitmapFont.from = function (name, textStyle, options) {
        if (!name) {
            throw new Error('[BitmapFont] Property `name` is required.');
        }
        var _a = Object.assign({}, BitmapFont.defaultOptions, options), chars = _a.chars, padding = _a.padding, resolution = _a.resolution, textureWidth = _a.textureWidth, textureHeight = _a.textureHeight;
        var charsList = resolveCharacters(chars);
        var style = textStyle instanceof TextStyle ? textStyle : new TextStyle(textStyle);
        var lineWidth = textureWidth;
        var fontData = new BitmapFontData();
        fontData.info[0] = {
            face: style.fontFamily,
            size: style.fontSize,
        };
        fontData.common[0] = {
            lineHeight: style.fontSize,
        };
        var positionX = 0;
        var positionY = 0;
        var canvas;
        var context;
        var baseTexture;
        var maxCharHeight = 0;
        var textures = [];
        for (var i = 0; i < charsList.length; i++) {
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = textureWidth;
                canvas.height = textureHeight;
                context = canvas.getContext('2d');
                baseTexture = new BaseTexture(canvas, { resolution: resolution });
                textures.push(new Texture(baseTexture));
                fontData.page.push({
                    id: textures.length - 1,
                    file: '',
                });
            }
            // Measure glyph dimensions
            var metrics = TextMetrics.measureText(charsList[i], style, false, canvas);
            var width = metrics.width;
            var height = Math.ceil(metrics.height);
            // This is ugly - but italics are given more space so they don't overlap
            var textureGlyphWidth = Math.ceil((style.fontStyle === 'italic' ? 2 : 1) * width);
            // Can't fit char anymore: next canvas please!
            if (positionY >= textureHeight - (height * resolution)) {
                if (positionY === 0) {
                    // We don't want user debugging an infinite loop (or do we? :)
                    throw new Error("[BitmapFont] textureHeight " + textureHeight + "px is "
                        + ("too small for " + style.fontSize + "px fonts"));
                }
                --i;
                // Create new atlas once current has filled up
                canvas = null;
                context = null;
                baseTexture = null;
                positionY = 0;
                positionX = 0;
                maxCharHeight = 0;
                continue;
            }
            maxCharHeight = Math.max(height + metrics.fontProperties.descent, maxCharHeight);
            // Wrap line once full row has been rendered
            if ((textureGlyphWidth * resolution) + positionX >= lineWidth) {
                --i;
                positionY += maxCharHeight * resolution;
                positionY = Math.ceil(positionY);
                positionX = 0;
                maxCharHeight = 0;
                continue;
            }
            drawGlyph(canvas, context, metrics, positionX, positionY, resolution, style);
            // Unique (numeric) ID mapping to this glyph
            var id = metrics.text.charCodeAt(0);
            // Create a texture holding just the glyph
            fontData.char.push({
                id: id,
                page: textures.length - 1,
                x: positionX / resolution,
                y: positionY / resolution,
                width: textureGlyphWidth,
                height: height,
                xoffset: 0,
                yoffset: 0,
                xadvance: Math.ceil(width
                    - (style.dropShadow ? style.dropShadowDistance : 0)
                    - (style.stroke ? style.strokeThickness : 0)),
            });
            positionX += (textureGlyphWidth + (2 * padding)) * resolution;
            positionX = Math.ceil(positionX);
        }
        // Brute-force kerning info, this can be expensive b/c it's an O(n²),
        // but we're using measureText which is native and fast.
        for (var i = 0, len = charsList.length; i < len; i++) {
            var first = charsList[i];
            for (var j = 0; j < len; j++) {
                var second = charsList[j];
                var c1 = context.measureText(first).width;
                var c2 = context.measureText(second).width;
                var total = context.measureText(first + second).width;
                var amount = total - (c1 + c2);
                if (amount) {
                    fontData.kerning.push({
                        first: first.charCodeAt(0),
                        second: second.charCodeAt(0),
                        amount: amount,
                    });
                }
            }
        }
        var font = new BitmapFont(fontData, textures);
        // Make it easier to replace a font
        if (BitmapFont.available[name] !== undefined) {
            BitmapFont.uninstall(name);
        }
        BitmapFont.available[name] = font;
        return font;
    };
    /**
     * This character set includes all the letters in the alphabet (both lower- and upper- case).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.ALPHA })
     */
    BitmapFont.ALPHA = [['a', 'z'], ['A', 'Z'], ' '];
    /**
     * This character set includes all decimal digits (from 0 to 9).
     * @readonly
     * @static
     * @member {string[][]}
     * @example
     * BitmapFont.from("ExampleFont", style, { chars: BitmapFont.NUMERIC })
     */
    BitmapFont.NUMERIC = [['0', '9']];
    /**
     * This character set is the union of `BitmapFont.ALPHA` and `BitmapFont.NUMERIC`.
     * @readonly
     * @static
     * @member {string[][]}
     */
    BitmapFont.ALPHANUMERIC = [['a', 'z'], ['A', 'Z'], ['0', '9'], ' '];
    /**
     * This character set consists of all the ASCII table.
     * @readonly
     * @static
     * @member {string[][]}
     * @see http://www.asciitable.com/
     */
    BitmapFont.ASCII = [[' ', '~']];
    /**
     * Collection of default options when using `BitmapFont.from`.
     *
     * @readonly
     * @static
     * @member {PIXI.IBitmapFontOptions}
     * @property {number} resolution=1
     * @property {number} textureWidth=512
     * @property {number} textureHeight=512
     * @property {number} padding=4
     * @property {string|string[]|string[][]} chars = PIXI.BitmapFont.ALPHANUMERIC
     */
    BitmapFont.defaultOptions = {
        resolution: 1,
        textureWidth: 512,
        textureHeight: 512,
        padding: 4,
        chars: BitmapFont.ALPHANUMERIC,
    };
    /**
     * Collection of available/installed fonts.
     *
     * @readonly
     * @static
     * @member {Object.<string, PIXI.BitmapFont>}
     */
    BitmapFont.available = {};
    return BitmapFont;
}());
/**
 * @memberof PIXI
 * @interface IBitmapFontOptions
 * @property {string | string[] | string[][]} [chars=PIXI.BitmapFont.ALPHANUMERIC] - the character set to generate
 * @property {number} [resolution=1] - the resolution for rendering
 * @property {number} [padding=4] - the padding between glyphs in the atlas
 * @property {number} [textureWidth=512] - the width of the texture atlas
 * @property {number} [textureHeight=512] - the height of the texture atlas
 */

var pageMeshDataPool = [];
var charRenderDataPool = [];
/**
 * A BitmapText object will create a line or multiple lines of text using bitmap font.
 *
 * The primary advantage of this class over Text is that all of your textures are pre-generated and loading,
 * meaning that rendering is fast, and changing text has no performance implications.
 *
 * Supporting character sets other than latin, such as CJK languages, may be impractical due to the number of characters.
 *
 * To split a line you can use '\n', '\r' or '\r\n' in your string.
 *
 * PixiJS can auto-generate fonts on-the-fly using BitmapFont or use fnt files provided by:
 * http://www.angelcode.com/products/bmfont/ for Windows or
 * http://www.bmglyph.com/ for Mac.
 *
 * A BitmapText can only be created when the font is loaded.
 *
 * ```js
 * // in this case the font is in a file called 'desyrel.fnt'
 * let bitmapText = new PIXI.BitmapText("text using a fancy font!", {font: "35px Desyrel", align: "right"});
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
var BitmapText = /** @class */ (function (_super) {
    __extends(BitmapText, _super);
    /**
     * @param {string} text - A string that you would like the text to display.
     * @param {object} style - The style parameters.
     * @param {string} style.fontName - The installed BitmapFont name.
     * @param {number} [style.fontSize] - The size of the font in pixels, e.g. 24. If undefined,
     *.     this will default to the BitmapFont size.
     * @param {string} [style.align='left'] - Alignment for multiline text ('left', 'center' or 'right'),
     *      does not affect single line text.
     * @param {number} [style.tint=0xFFFFFF] - The tint color.
     * @param {number} [style.letterSpacing=0] - The amount of spacing between letters.
     * @param {number} [style.maxWidth=0] - The max width of the text before line wrapping.
     */
    function BitmapText(text, style) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this) || this;
        _this._tint = 0xFFFFFF;
        if (style.font) {
            deprecation('5.3.0', 'PIXI.BitmapText constructor style.font property is deprecated.');
            _this._upgradeStyle(style);
        }
        // Apply the defaults
        var _a = Object.assign({}, BitmapText.styleDefaults, style), align = _a.align, tint = _a.tint, maxWidth = _a.maxWidth, letterSpacing = _a.letterSpacing, fontName = _a.fontName, fontSize = _a.fontSize;
        if (!BitmapFont.available[fontName]) {
            throw new Error("Missing BitmapFont \"" + fontName + "\"");
        }
        /**
         * Collection of page mesh data.
         *
         * @member {object}
         * @private
         */
        _this._activePagesMeshData = [];
        /**
         * Private tracker for the width of the overall text
         *
         * @member {number}
         * @private
         */
        _this._textWidth = 0;
        /**
         * Private tracker for the height of the overall text
         *
         * @member {number}
         * @private
         */
        _this._textHeight = 0;
        /**
         * Private tracker for the current text align.
         *
         * @member {string}
         * @private
         */
        _this._align = align;
        /**
         * Private tracker for the current tint.
         *
         * @member {number}
         * @private
         */
        _this._tint = tint;
        /**
         * Private tracker for the current font name.
         *
         * @member {string}
         * @private
         */
        _this._fontName = fontName;
        /**
         * Private tracker for the current font size.
         *
         * @member {number}
         * @private
         */
        _this._fontSize = fontSize || BitmapFont.available[fontName].size;
        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        _this._text = text;
        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting value to 0
         *
         * @member {number}
         * @private
         */
        _this._maxWidth = maxWidth;
        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * ie: when trying to vertically align. (Internally used)
         *
         * @member {number}
         * @private
         */
        _this._maxLineHeight = 0;
        /**
         * Letter spacing. This is useful for setting the space between characters.
         * @member {number}
         * @private
         */
        _this._letterSpacing = letterSpacing;
        /**
         * Text anchor. read-only
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        _this._anchor = new ObservablePoint(function () { _this.dirty = true; }, _this, 0, 0);
        /**
         * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Advantages can include sharper image quality (like text) and faster rendering on canvas.
         * The main disadvantage is movement of objects may appear less smooth.
         * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
         *
         * @member {boolean}
         * @default PIXI.settings.ROUND_PIXELS
         */
        _this.roundPixels = settings.ROUND_PIXELS;
        /**
         * Set to `true` if the BitmapText needs to be redrawn.
         *
         * @member {boolean}
         */
        _this.dirty = true;
        return _this;
    }
    /**
     * Renders text and updates it when needed. This should only be called
     * if the BitmapFont is regenerated.
     */
    BitmapText.prototype.updateText = function () {
        var _a;
        var data = BitmapFont.available[this._fontName];
        var scale = this._fontSize / data.size;
        var pos = new Point();
        var chars = [];
        var lineWidths = [];
        var text = this._text.replace(/(?:\r\n|\r)/g, '\n') || ' ';
        var textLength = text.length;
        var maxWidth = this._maxWidth * data.size / this._fontSize;
        var prevCharCode = null;
        var lastLineWidth = 0;
        var maxLineWidth = 0;
        var line = 0;
        var lastBreakPos = -1;
        var lastBreakWidth = 0;
        var spacesRemoved = 0;
        var maxLineHeight = 0;
        for (var i = 0; i < textLength; i++) {
            var charCode = text.charCodeAt(i);
            var char = text.charAt(i);
            if ((/(?:\s)/).test(char)) {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }
            if (char === '\r' || char === '\n') {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;
                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }
            var charData = data.chars[charCode];
            if (!charData) {
                continue;
            }
            if (prevCharCode && charData.kerning[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode];
            }
            var charRenderData = charRenderDataPool.pop() || {
                texture: Texture.EMPTY,
                line: 0,
                charCode: 0,
                position: new Point(),
            };
            charRenderData.texture = charData.texture;
            charRenderData.line = line;
            charRenderData.charCode = charCode;
            charRenderData.position.x = pos.x + charData.xOffset + (this._letterSpacing / 2);
            charRenderData.position.y = pos.y + charData.yOffset;
            chars.push(charRenderData);
            pos.x += charData.xAdvance + this._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;
            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth) {
                ++spacesRemoved;
                removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;
                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;
                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
            }
        }
        var lastChar = text.charAt(text.length - 1);
        if (lastChar !== '\r' && lastChar !== '\n') {
            if ((/(?:\s)/).test(lastChar)) {
                lastLineWidth = lastBreakWidth;
            }
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }
        var lineAlignOffsets = [];
        for (var i = 0; i <= line; i++) {
            var alignOffset = 0;
            if (this._align === 'right') {
                alignOffset = maxLineWidth - lineWidths[i];
            }
            else if (this._align === 'center') {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
        }
        var lenChars = chars.length;
        var pagesMeshData = {};
        var newPagesMeshData = [];
        var activePagesMeshData = this._activePagesMeshData;
        for (var i = 0; i < activePagesMeshData.length; i++) {
            pageMeshDataPool.push(activePagesMeshData[i]);
        }
        for (var i = 0; i < lenChars; i++) {
            var texture = chars[i].texture;
            var baseTextureUid = texture.baseTexture.uid;
            if (!pagesMeshData[baseTextureUid]) {
                var pageMeshData = pageMeshDataPool.pop();
                if (!pageMeshData) {
                    var geometry = new MeshGeometry();
                    var material = new MeshMaterial(Texture.EMPTY);
                    var mesh = new Mesh(geometry, material);
                    pageMeshData = {
                        index: 0,
                        indexCount: 0,
                        vertexCount: 0,
                        uvsCount: 0,
                        total: 0,
                        mesh: mesh,
                        vertices: null,
                        uvs: null,
                        indices: null,
                    };
                }
                // reset data..
                pageMeshData.index = 0;
                pageMeshData.indexCount = 0;
                pageMeshData.vertexCount = 0;
                pageMeshData.uvsCount = 0;
                pageMeshData.total = 0;
                // TODO need to get page texture here somehow..
                pageMeshData.mesh.texture = new Texture(texture.baseTexture);
                pageMeshData.mesh.tint = this._tint;
                newPagesMeshData.push(pageMeshData);
                pagesMeshData[baseTextureUid] = pageMeshData;
            }
            pagesMeshData[baseTextureUid].total++;
        }
        // lets find any previously active pageMeshDatas that are no longer required for
        // the updated text (if any), removed and return them to the pool.
        for (var i = 0; i < activePagesMeshData.length; i++) {
            if (newPagesMeshData.indexOf(activePagesMeshData[i]) === -1) {
                this.removeChild(activePagesMeshData[i].mesh);
            }
        }
        // next lets add any new meshes, that have not yet been added to this BitmapText
        // we only add if its not already a child of this BitmapObject
        for (var i = 0; i < newPagesMeshData.length; i++) {
            if (newPagesMeshData[i].mesh.parent !== this) {
                this.addChild(newPagesMeshData[i].mesh);
            }
        }
        // active page mesh datas are set to be the new pages added.
        this._activePagesMeshData = newPagesMeshData;
        for (var i in pagesMeshData) {
            var pageMeshData = pagesMeshData[i];
            var total = pageMeshData.total;
            // lets only allocate new buffers if we can fit the new text in the current ones..
            // unless that is, we will be batching. Currently batching dose not respect the size property of mesh
            if (!(((_a = pageMeshData.indices) === null || _a === void 0 ? void 0 : _a.length) > 6 * total) || pageMeshData.vertices.length < Mesh.BATCHABLE_SIZE * 2) {
                pageMeshData.vertices = new Float32Array(4 * 2 * total);
                pageMeshData.uvs = new Float32Array(4 * 2 * total);
                pageMeshData.indices = new Uint16Array(6 * total);
            }
            else {
                var total_1 = pageMeshData.total;
                var vertices = pageMeshData.vertices;
                // Clear the garbage at the end of the vertices buffer. This will prevent the bounds miscalculation.
                for (var i_1 = total_1 * 4 * 2; i_1 < vertices.length; i_1++) {
                    vertices[i_1] = 0;
                }
            }
            // as a buffer maybe bigger than the current word, we set the size of the meshMaterial
            // to match the number of letters needed
            pageMeshData.mesh.size = 6 * total;
        }
        for (var i = 0; i < lenChars; i++) {
            var char = chars[i];
            var xPos = (char.position.x + lineAlignOffsets[char.line]) * scale;
            var yPos = char.position.y * scale;
            var texture = char.texture;
            var pageMesh = pagesMeshData[texture.baseTexture.uid];
            var textureFrame = texture.frame;
            var textureUvs = texture._uvs;
            var index = pageMesh.index++;
            pageMesh.indices[(index * 6) + 0] = 0 + (index * 4);
            pageMesh.indices[(index * 6) + 1] = 1 + (index * 4);
            pageMesh.indices[(index * 6) + 2] = 2 + (index * 4);
            pageMesh.indices[(index * 6) + 3] = 0 + (index * 4);
            pageMesh.indices[(index * 6) + 4] = 2 + (index * 4);
            pageMesh.indices[(index * 6) + 5] = 3 + (index * 4);
            pageMesh.vertices[(index * 8) + 0] = xPos;
            pageMesh.vertices[(index * 8) + 1] = yPos;
            pageMesh.vertices[(index * 8) + 2] = xPos + (textureFrame.width * scale);
            pageMesh.vertices[(index * 8) + 3] = yPos;
            pageMesh.vertices[(index * 8) + 4] = xPos + (textureFrame.width * scale);
            pageMesh.vertices[(index * 8) + 5] = yPos + (textureFrame.height * scale);
            pageMesh.vertices[(index * 8) + 6] = xPos;
            pageMesh.vertices[(index * 8) + 7] = yPos + (textureFrame.height * scale);
            pageMesh.uvs[(index * 8) + 0] = textureUvs.x0;
            pageMesh.uvs[(index * 8) + 1] = textureUvs.y0;
            pageMesh.uvs[(index * 8) + 2] = textureUvs.x1;
            pageMesh.uvs[(index * 8) + 3] = textureUvs.y1;
            pageMesh.uvs[(index * 8) + 4] = textureUvs.x2;
            pageMesh.uvs[(index * 8) + 5] = textureUvs.y2;
            pageMesh.uvs[(index * 8) + 6] = textureUvs.x3;
            pageMesh.uvs[(index * 8) + 7] = textureUvs.y3;
        }
        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + data.lineHeight) * scale;
        for (var i in pagesMeshData) {
            var pageMeshData = pagesMeshData[i];
            // apply anchor
            if (this.anchor.x !== 0 || this.anchor.y !== 0) {
                var vertexCount = 0;
                var anchorOffsetX = this._textWidth * this.anchor.x;
                var anchorOffsetY = this._textHeight * this.anchor.y;
                for (var i_2 = 0; i_2 < pageMeshData.total; i_2++) {
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
                    pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
                }
            }
            this._maxLineHeight = maxLineHeight * scale;
            var vertexBuffer = pageMeshData.mesh.geometry.getBuffer('aVertexPosition');
            var textureBuffer = pageMeshData.mesh.geometry.getBuffer('aTextureCoord');
            var indexBuffer = pageMeshData.mesh.geometry.getIndex();
            vertexBuffer.data = pageMeshData.vertices;
            textureBuffer.data = pageMeshData.uvs;
            indexBuffer.data = pageMeshData.indices;
            vertexBuffer.update();
            textureBuffer.update();
            indexBuffer.update();
        }
        for (var i = 0; i < chars.length; i++) {
            charRenderDataPool.push(chars[i]);
        }
    };
    /**
     * Updates the transform of this object
     *
     * @private
     */
    BitmapText.prototype.updateTransform = function () {
        this.validate();
        this.containerUpdateTransform();
    };
    /**
     * Validates text before calling parent's getLocalBounds
     *
     * @return {PIXI.Rectangle} The rectangular bounding area
     */
    BitmapText.prototype.getLocalBounds = function () {
        this.validate();
        return _super.prototype.getLocalBounds.call(this);
    };
    /**
     * Updates text when needed
     *
     * @private
     */
    BitmapText.prototype.validate = function () {
        if (this.dirty) {
            this.updateText();
            this.dirty = false;
        }
    };
    Object.defineProperty(BitmapText.prototype, "tint", {
        /**
         * The tint of the BitmapText object.
         *
         * @member {number}
         * @default 0xffffff
         */
        get: function () {
            return this._tint;
        },
        set: function (value) {
            if (this._tint === value)
                { return; }
            this._tint = value;
            for (var i = 0; i < this._activePagesMeshData.length; i++) {
                this._activePagesMeshData[i].mesh.tint = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "align", {
        /**
         * The alignment of the BitmapText object.
         *
         * @member {string}
         * @default 'left'
         */
        get: function () {
            return this._align;
        },
        set: function (value) {
            if (this._align !== value) {
                this._align = value;
                this.dirty = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "fontName", {
        /**
         * The name of the BitmapFont.
         *
         * @member {string}
         */
        get: function () {
            return this._fontName;
        },
        set: function (value) {
            if (!BitmapFont.available[value]) {
                throw new Error("Missing BitmapFont \"" + value + "\"");
            }
            if (this._fontName !== value) {
                this._fontName = value;
                this.dirty = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "fontSize", {
        /**
         * The size of the font to display.
         *
         * @member {number}
         */
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            if (this._fontSize !== value) {
                this._fontSize = value;
                this.dirty = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "anchor", {
        /**
         * The anchor sets the origin point of the text.
         *
         * The default is `(0,0)`, this means the text's origin is the top left.
         *
         * Setting the anchor to `(0.5,0.5)` means the text's origin is centered.
         *
         * Setting the anchor to `(1,1)` would mean the text's origin point will be the bottom right corner.
         *
         * @member {PIXI.Point | number}
         */
        get: function () {
            return this._anchor;
        },
        set: function (value) {
            if (typeof value === 'number') {
                this._anchor.set(value);
            }
            else {
                this._anchor.copyFrom(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "text", {
        /**
         * The text of the BitmapText object.
         *
         * @member {string}
         */
        get: function () {
            return this._text;
        },
        set: function (text) {
            text = String(text === null || text === undefined ? '' : text);
            if (this._text === text) {
                return;
            }
            this._text = text;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "maxWidth", {
        /**
         * The max width of this bitmap text in pixels. If the text provided is longer than the
         * value provided, line breaks will be automatically inserted in the last whitespace.
         * Disable by setting the value to 0.
         *
         * @member {number}
         */
        get: function () {
            return this._maxWidth;
        },
        set: function (value) {
            if (this._maxWidth === value) {
                return;
            }
            this._maxWidth = value;
            this.dirty = true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "maxLineHeight", {
        /**
         * The max line height. This is useful when trying to use the total height of the Text,
         * i.e. when trying to vertically align.
         *
         * @member {number}
         * @readonly
         */
        get: function () {
            this.validate();
            return this._maxLineHeight;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "textWidth", {
        /**
         * The width of the overall text, different from fontSize,
         * which is defined in the style object.
         *
         * @member {number}
         * @readonly
         */
        get: function () {
            this.validate();
            return this._textWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "letterSpacing", {
        /**
         * Additional space between characters.
         *
         * @member {number}
         */
        get: function () {
            return this._letterSpacing;
        },
        set: function (value) {
            if (this._letterSpacing !== value) {
                this._letterSpacing = value;
                this.dirty = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BitmapText.prototype, "textHeight", {
        /**
         * The height of the overall text, different from fontSize,
         * which is defined in the style object.
         *
         * @member {number}
         * @readonly
         */
        get: function () {
            this.validate();
            return this._textHeight;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * For backward compatibility, convert old style.font constructor param to fontName & fontSize properties.
     *
     * @private
     * @deprecated since 5.3.0
     */
    BitmapText.prototype._upgradeStyle = function (style) {
        if (typeof style.font === 'string') {
            var valueSplit = style.font.split(' ');
            style.fontName = valueSplit.length === 1
                ? valueSplit[0]
                : valueSplit.slice(1).join(' ');
            if (valueSplit.length >= 2) {
                style.fontSize = parseInt(valueSplit[0], 10);
            }
        }
        else {
            style.fontName = style.font.name;
            style.fontSize = typeof style.font.size === 'number'
                ? style.font.size
                : parseInt(style.font.size, 10);
        }
    };
    /**
     * Register a bitmap font with data and a texture.
     *
     * @deprecated since 5.3.0
     * @see PIXI.BitmapFont.install
     * @static
     */
    BitmapText.registerFont = function (data, textures) {
        deprecation('5.3.0', 'PIXI.BitmapText.registerFont is deprecated, use PIXI.BitmapFont.install');
        return BitmapFont.install(data, textures);
    };
    Object.defineProperty(BitmapText, "fonts", {
        /**
         * Get the list of installed fonts.
         *
         * @see PIXI.BitmapFont.available
         * @deprecated since 5.3.0
         * @static
         * @readonly
         * @member {Object.<string, PIXI.BitmapFont>}
         */
        get: function () {
            deprecation('5.3.0', 'PIXI.BitmapText.fonts is deprecated, use PIXI.BitmapFont.available');
            return BitmapFont.available;
        },
        enumerable: false,
        configurable: true
    });
    BitmapText.styleDefaults = {
        align: 'left',
        tint: 0xFFFFFF,
        maxWidth: 0,
        letterSpacing: 0,
    };
    return BitmapText;
}(Container));

/**
 * {@link PIXI.Loader Loader} middleware for loading
 * bitmap-based fonts suitable for using with {@link PIXI.BitmapText}.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
var BitmapFontLoader = /** @class */ (function () {
    function BitmapFontLoader() {
    }
    /**
     * Called when the plugin is installed.
     *
     * @see PIXI.Loader.registerPlugin
     */
    BitmapFontLoader.add = function () {
        LoaderResource.setExtensionXhrType('fnt', LoaderResource.XHR_RESPONSE_TYPE.TEXT);
    };
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    BitmapFontLoader.use = function (resource, next) {
        var format = autoDetectFormat(resource.data);
        // Resource was not recognised as any of the expected font data format
        if (!format) {
            next();
            return;
        }
        var baseUrl = BitmapFontLoader.getBaseUrl(this, resource);
        var data = format.parse(resource.data);
        var textures = {};
        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        var completed = function (page) {
            textures[page.metadata.pageFile] = page.texture;
            if (Object.keys(textures).length === data.page.length) {
                resource.bitmapFont = BitmapFont.install(data, textures);
                next();
            }
        };
        for (var i = 0; i < data.page.length; ++i) {
            var pageFile = data.page[i].file;
            var url = baseUrl + pageFile;
            var exists = false;
            // incase the image is loaded outside
            // using the same loader, resource will be available
            for (var name in this.resources) {
                var bitmapResource = this.resources[name];
                if (bitmapResource.url === url) {
                    bitmapResource.metadata.pageFile = pageFile;
                    if (bitmapResource.texture) {
                        completed(bitmapResource);
                    }
                    else {
                        bitmapResource.onAfterMiddleware.add(completed);
                    }
                    exists = true;
                    break;
                }
            }
            // texture is not loaded, we'll attempt to add
            // it to the load and add the texture to the list
            if (!exists) {
                // Standard loading options for images
                var options = {
                    crossOrigin: resource.crossOrigin,
                    loadType: LoaderResource.LOAD_TYPE.IMAGE,
                    metadata: Object.assign({ pageFile: pageFile }, resource.metadata.imageMetadata),
                    parentResource: resource,
                };
                this.add(url, options, completed);
            }
        }
    };
    /**
     * Get folder path from a resource
     * @private
     * @param {PIXI.Loader} loader
     * @param {PIXI.LoaderResource} resource
     * @return {string}
     */
    BitmapFontLoader.getBaseUrl = function (loader, resource) {
        var resUrl = !resource.isDataUrl ? BitmapFontLoader.dirname(resource.url) : '';
        if (resource.isDataUrl) {
            if (resUrl === '.') {
                resUrl = '';
            }
            if (loader.baseUrl && resUrl) {
                // if baseurl has a trailing slash then add one to resUrl so the replace works below
                if (loader.baseUrl.charAt(loader.baseUrl.length - 1) === '/') {
                    resUrl += '/';
                }
            }
        }
        // remove baseUrl from resUrl
        resUrl = resUrl.replace(loader.baseUrl, '');
        // if there is an resUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (resUrl && resUrl.charAt(resUrl.length - 1) !== '/') {
            resUrl += '/';
        }
        return resUrl;
    };
    /**
     * Replacement for NodeJS's path.dirname
     * @private
     * @param {string} url - Path to get directory for
     */
    BitmapFontLoader.dirname = function (url) {
        var dir = url
            .replace(/\\/g, '/') // convert windows notation to UNIX notation, URL-safe because it's a forbidden character
            .replace(/\/$/, '') // replace trailing slash
            .replace(/\/[^\/]*$/, ''); // remove everything after the last
        // File request is relative, use current directory
        if (dir === url) {
            return '.';
        }
        // Started with a slash
        else if (dir === '') {
            return '/';
        }
        return dir;
    };
    return BitmapFontLoader;
}());

export { BitmapFont, BitmapFontData, BitmapFontLoader, BitmapText };
//# sourceMappingURL=text-bitmap.es.js.map
