'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('../WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

var _GLTexture = require('./GLTexture');

var _GLTexture2 = _interopRequireDefault(_GLTexture);

var _utils = require('../../../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
var TextureSystem = function (_WebGLSystem) {
    _inherits(TextureSystem, _WebGLSystem);

    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this System works for.
     */
    function TextureSystem(renderer) {
        _classCallCheck(this, TextureSystem);

        // TODO set to max textures...
        var _this = _possibleConstructorReturn(this, _WebGLSystem.call(this, renderer));

        _this.boundTextures = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

        _this.currentLocation = -1;

        _this.managedTextures = [];
        return _this;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */


    TextureSystem.prototype.contextChange = function contextChange() {
        var gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        // TODO move this.. to a nice make empty textures class..
        this.emptyTextures = {};

        this.emptyTextures[gl.TEXTURE_2D] = new _GLTexture2.default.fromData(this.gl, null, 1, 1);
        this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new _GLTexture2.default(this.gl);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

        var i = void 0;

        for (i = 0; i < 6; i++) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        for (i = 0; i < maxTextures; i++) {
            this.bind(null, i);
        }
    };

    TextureSystem.prototype.bind = function bind(texture, location) {
        var gl = this.gl;

        location = location || 0;

        if (this.currentLocation !== location) {
            this.currentLocation = location;
            gl.activeTexture(gl.TEXTURE0 + location);
        }

        if (texture) {
            texture = texture.baseTexture || texture;

            if (texture.valid) {
                var glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

                gl.bindTexture(texture.target, glTexture.texture);

                if (glTexture.dirtyId !== texture.dirtyId) {
                    glTexture.dirtyId = texture.dirtyId;
                    this.updateTexture(texture);
                }

                this.boundTextures[location] = texture;
            }
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
            this.boundTextures[location] = null;
        }
    };

    TextureSystem.prototype.unbind = function unbind(texture) {
        var gl = this.gl;

        for (var i = 0; i < this.boundTextures.length; i++) {
            if (this.boundTextures[i] === texture) {
                if (this.currentLocation !== i) {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    this.currentLocation = i;
                }

                gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[texture.target].texture);
                this.boundTextures[i] = null;
            }
        }
    };

    TextureSystem.prototype.initTexture = function initTexture(texture) {
        var glTexture = new _GLTexture2.default(this.gl, -1, -1, texture.format, texture.type);

        glTexture.premultiplyAlpha = texture.premultiplyAlpha;
        // guarentee an update..
        glTexture.dirtyId = -1;

        texture._glTextures[this.CONTEXT_UID] = glTexture;

        this.managedTextures.push(texture);
        texture.on('dispose', this.destroyTexture, this);

        return glTexture;
    };

    TextureSystem.prototype.updateTexture = function updateTexture(texture) {
        var glTexture = texture._glTextures[this.CONTEXT_UID];
        var gl = this.gl;

        var i = void 0;
        var texturePart = void 0;

        // TODO there are only 3 textures as far as im aware?
        // Cube / 2D and later 3d. (the latter is WebGL2, we will get to that soon!)
        if (texture.target === gl.TEXTURE_CUBE_MAP) {
            // console.log( gl.UNSIGNED_BYTE)
            for (i = 0; i < texture.sides.length; i++) {
                // TODO - we should only upload what changed..
                // but im sure this is not  going to be a problem just yet!
                texturePart = texture.sides[i];

                if (texturePart.resource) {
                    if (texturePart.resource.uploadable) {
                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side, 0, texture.format, texture.format, texture.type, texturePart.resource.source);
                    } else {
                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side, 0, texture.format, texture.width, texture.height, 0, texture.format, texture.type, texturePart.resource.source);
                    }
                } else {
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + texturePart.side, 0, texture.format, texture.width, texture.height, 0, texture.format, texture.type, null);
                }
            }
        } else if (texture.target === gl.TEXTURE_2D_ARRAY) {
            gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, texture.format, texture.width, texture.height, 6, 0, texture.format, texture.type, null);

            for (i = 0; i < texture.array.length; i++) {
                // TODO - we should only upload what changed..
                // but im sure this is not  going to be a problem just yet!
                texturePart = texture.array[i];

                if (texturePart.resource) {
                    if (texturePart.resource.loaded) {
                        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, // xoffset
                        0, // yoffset
                        i, // zoffset
                        texturePart.resource.width, texturePart.resource.height, 1, texture.format, texture.type, texturePart.resource.source);
                    }
                }
            }
        } else if (texture.resource) {
            if (texture.resource.uploadable) {
                glTexture.upload(texture.resource.source);
            } else {
                glTexture.uploadData(texture.resource.source, texture.width, texture.height);
            }
        } else {
            glTexture.uploadData(null, texture.width, texture.height);
        }

        // lets only update what changes..
        this.setStyle(texture);
    };

    /**
     * Deletes the texture from WebGL
     *
     * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to destroy
     * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
     */


    TextureSystem.prototype.destroyTexture = function destroyTexture(texture, skipRemove) {
        texture = texture.baseTexture || texture;

        if (texture._glTextures[this.renderer.CONTEXT_UID]) {
            this.unbind(texture);

            texture._glTextures[this.renderer.CONTEXT_UID].destroy();
            texture.off('dispose', this.destroyTexture, this);

            delete texture._glTextures[this.renderer.CONTEXT_UID];

            if (!skipRemove) {
                var i = this.managedTextures.indexOf(texture);

                if (i !== -1) {
                    (0, _utils.removeItems)(this.managedTextures, i, 1);
                }
            }
        }
    };

    TextureSystem.prototype.setStyle = function setStyle(texture) {
        var gl = this.gl;

        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, texture.wrapMode);
        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, texture.wrapMode);

        if (texture.mipmap) {
            /* eslint-disable max-len */
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            /* eslint-disable max-len */
        } else {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
    };

    return TextureSystem;
}(_WebGLSystem3.default);

exports.default = TextureSystem;
//# sourceMappingURL=TextureSystem.js.map