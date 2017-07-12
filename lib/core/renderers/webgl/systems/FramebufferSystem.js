'use strict';

exports.__esModule = true;

var _WebGLSystem2 = require('./WebGLSystem');

var _WebGLSystem3 = _interopRequireDefault(_WebGLSystem2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class
 * @extends PIXI.WebGLSystem
 * @memberof PIXI
 */
var FramebufferSystem = function (_WebGLSystem) {
    _inherits(FramebufferSystem, _WebGLSystem);

    function FramebufferSystem() {
        _classCallCheck(this, FramebufferSystem);

        return _possibleConstructorReturn(this, _WebGLSystem.apply(this, arguments));
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    FramebufferSystem.prototype.contextChange = function contextChange() {
        this.gl = this.renderer.gl;
        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        this.drawBufferExtension = this.renderer.context.extensions.drawBuffers;
    };

    FramebufferSystem.prototype.bind = function bind(framebuffer) {
        var gl = this.gl;

        if (framebuffer) {
            // TODO cacheing layer!

            var fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
            // makesure all textures are unbound..

            // now check for updates...
            if (fbo.dirtyId !== framebuffer.dirtyId) {
                fbo.dirtyId = framebuffer.dirtyId;

                if (fbo.dirtyFormat !== framebuffer.dirtyFormat) {
                    fbo.dirtyFormat = framebuffer.dirtyFormat;
                    this.updateFramebuffer(framebuffer);
                } else if (fbo.dirtySize !== framebuffer.dirtySize) {
                    fbo.dirtySize = framebuffer.dirtySize;
                    this.resizeFramebuffer(framebuffer);
                }
            }

            for (var i = 0; i < framebuffer.colorTextures.length; i++) {
                if (framebuffer.colorTextures[i].texturePart) {
                    this.renderer.texture.unbind(framebuffer.colorTextures[i].texture);
                } else {
                    this.renderer.texture.unbind(framebuffer.colorTextures[i]);
                }
            }

            if (framebuffer.depthTexture) {
                this.renderer.texture.unbind(framebuffer.depthTexture);
            }

            gl.viewport(0, 0, framebuffer.width, framebuffer.height);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(0, 0, this.renderer.width, this.renderer.height);
        }
    };

    FramebufferSystem.prototype.clear = function clear(r, g, b, a) {
        var gl = this.gl;

        // TODO clear color can be set only one right?
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    // private functions...

    FramebufferSystem.prototype.initFramebuffer = function initFramebuffer(framebuffer) {
        var gl = this.gl;

        // TODO - make this a class?
        var fbo = {
            framebuffer: gl.createFramebuffer(),
            stencil: null,
            dirtyId: 0,
            dirtyFormat: 0,
            dirtySize: 0
        };

        framebuffer.glFrameBuffers[this.CONTEXT_UID] = fbo;

        return fbo;
    };

    FramebufferSystem.prototype.resizeFramebuffer = function resizeFramebuffer(framebuffer) {
        var gl = this.gl;

        if (framebuffer.stencil || framebuffer.depth) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
        }
    };

    FramebufferSystem.prototype.updateFramebuffer = function updateFramebuffer(framebuffer) {
        var gl = this.gl;

        var fbo = framebuffer.glFrameBuffers[this.CONTEXT_UID];

        // bind the color texture
        var colorTextures = framebuffer.colorTextures;

        var count = colorTextures.length;

        if (!this.drawBufferExtension) {
            count = Math.min(count, 1);
        }

        var activeTextures = [];

        for (var i = 0; i < count; i++) {
            var texture = framebuffer.colorTextures[i];

            if (texture.texturePart) {
                this.renderer.texture.bind(texture.texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_CUBE_MAP_NEGATIVE_X + texture.side, texture.texture._glTextures[this.CONTEXT_UID].texture, 0);
            } else {
                this.renderer.texture.bind(texture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture._glTextures[this.CONTEXT_UID].texture, 0);
            }

            activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
        }

        if (this.drawBufferExtension && activeTextures.length > 1) {
            this.drawBufferExtension.drawBuffersWEBGL(activeTextures);
        }

        if (framebuffer.depthTexture) {
            var depthTextureExt = this.renderer.context.extensions.depthTexture;

            if (depthTextureExt) {
                var depthTexture = framebuffer.depthTexture;

                this.renderer.texture.bind(depthTexture, 0);

                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture._glTextures[this.CONTEXT_UID].texture, 0);
            }
        }

        if (framebuffer.stencil || framebuffer.depth) {
            fbo.stencil = gl.createRenderbuffer();

            gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);

            // TODO.. this is depth AND stencil?
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
            // fbo.enableStencil();
        }
    };

    return FramebufferSystem;
}(_WebGLSystem3.default);

exports.default = FramebufferSystem;
//# sourceMappingURL=FramebufferSystem.js.map