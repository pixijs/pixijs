'use strict';

exports.__esModule = true;

var _core = require('../core');

var core = _interopRequireWildcard(_core);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The ParticleContainer class is a really fast version of the Container built solely for speed,
 * so use when you need a lot of sprites or particles. The tradeoff of the ParticleContainer is that advanced
 * functionality will not work. ParticleContainer implements only the basic object transform (position, scale, rotation).
 * Any other functionality like tinting, masking, etc will not work on sprites in this batch.
 *
 * It's extremely easy to use :
 *
 * ```js
 * let container = new ParticleContainer();
 *
 * for (let i = 0; i < 100; ++i)
 * {
 *     let sprite = new PIXI.Sprite.fromImage("myImage.png");
 *     container.addChild(sprite);
 * }
 * ```
 *
 * And here you have a hundred sprites that will be renderer at the speed of light.
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI.particles
 */
var ParticleContainer = function (_core$Container) {
    _inherits(ParticleContainer, _core$Container);

    /**
     * @param {number} [maxSize=15000] - The maximum number of particles that can be renderer by the container.
     * @param {object} [properties] - The properties of children that should be uploaded to the gpu and applied.
     * @param {boolean} [properties.scale=false] - When true, scale be uploaded and applied.
     * @param {boolean} [properties.position=true] - When true, position be uploaded and applied.
     * @param {boolean} [properties.rotation=false] - When true, rotation be uploaded and applied.
     * @param {boolean} [properties.uvs=false] - When true, uvs be uploaded and applied.
     * @param {boolean} [properties.alpha=false] - When true, alpha be uploaded and applied.
     * @param {number} [batchSize=15000] - Number of particles per batch.
     */
    function ParticleContainer() {
        var maxSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1500;
        var properties = arguments[1];
        var batchSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16384;

        _classCallCheck(this, ParticleContainer);

        // Making sure the batch size is valid
        // 65535 is max vertex index in the index buffer (see ParticleRenderer)
        // so max number of particles is 65536 / 4 = 16384
        var _this = _possibleConstructorReturn(this, _core$Container.call(this));

        var maxBatchSize = 16384;

        if (batchSize > maxBatchSize) {
            batchSize = maxBatchSize;
        }

        if (batchSize > maxSize) {
            batchSize = maxSize;
        }

        /**
         * Set properties to be dynamic (true) / static (false)
         *
         * @member {boolean[]}
         * @private
         */
        _this._properties = [false, true, false, false, false];

        /**
         * @member {number}
         * @private
         */
        _this._maxSize = maxSize;

        /**
         * @member {number}
         * @private
         */
        _this._batchSize = batchSize;

        /**
         * @member {object<number, WebGLBuffer>}
         * @private
         */
        _this._glBuffers = {};

        /**
         * @member {number}
         * @private
         */
        _this._bufferToUpdate = 0;

        /**
         * @member {boolean}
         *
         */
        _this.interactiveChildren = false;

        /**
         * The blend mode to be applied to the sprite. Apply a value of `PIXI.BLEND_MODES.NORMAL`
         * to reset the blend mode.
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        _this.blendMode = core.BLEND_MODES.NORMAL;

        /**
         * Used for canvas renderering. If true then the elements will be positioned at the
         * nearest pixel. This provides a nice speed boost.
         *
         * @member {boolean}
         * @default true;
         */
        _this.roundPixels = true;

        /**
         * The texture used to render the children.
         *
         * @readonly
         * @member {BaseTexture}
         */
        _this.baseTexture = null;

        _this.setProperties(properties);
        return _this;
    }

    /**
     * Sets the private properties array to dynamic / static based on the passed properties object
     *
     * @param {object} properties - The properties to be uploaded
     */


    ParticleContainer.prototype.setProperties = function setProperties(properties) {
        if (properties) {
            this._properties[0] = 'scale' in properties ? !!properties.scale : this._properties[0];
            this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
            this._properties[2] = 'rotation' in properties ? !!properties.rotation : this._properties[2];
            this._properties[3] = 'uvs' in properties ? !!properties.uvs : this._properties[3];
            this._properties[4] = 'alpha' in properties ? !!properties.alpha : this._properties[4];
        }
    };

    /**
     * Updates the object transform for rendering
     *
     * @private
     */


    ParticleContainer.prototype.updateTransform = function updateTransform() {
        // TODO don't need to!
        this.displayObjectUpdateTransform();
        //  PIXI.Container.prototype.updateTransform.call( this );
    };

    /**
     * Renders the container using the WebGL renderer
     *
     * @private
     * @param {PIXI.WebGLRenderer} renderer - The webgl renderer
     */


    ParticleContainer.prototype.renderWebGL = function renderWebGL(renderer) {
        var _this2 = this;

        if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
            return;
        }

        if (!this.baseTexture) {
            this.baseTexture = this.children[0]._texture.baseTexture;
            if (!this.baseTexture.hasLoaded) {
                this.baseTexture.once('update', function () {
                    return _this2.onChildrenChange(0);
                });
            }
        }

        renderer.setObjectRenderer(renderer.plugins.particle);
        renderer.plugins.particle.render(this);
    };

    /**
     * Set the flag that static data should be updated to true
     *
     * @private
     * @param {number} smallestChildIndex - The smallest child index
     */


    ParticleContainer.prototype.onChildrenChange = function onChildrenChange(smallestChildIndex) {
        var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);

        if (bufferIndex < this._bufferToUpdate) {
            this._bufferToUpdate = bufferIndex;
        }
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer
     */


    ParticleContainer.prototype.renderCanvas = function renderCanvas(renderer) {
        if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
            return;
        }

        var context = renderer.context;
        var transform = this.worldTransform;
        var isRotated = true;

        var positionX = 0;
        var positionY = 0;

        var finalWidth = 0;
        var finalHeight = 0;

        var compositeOperation = renderer.blendModes[this.blendMode];

        if (compositeOperation !== context.globalCompositeOperation) {
            context.globalCompositeOperation = compositeOperation;
        }

        context.globalAlpha = this.worldAlpha;

        this.displayObjectUpdateTransform();

        for (var i = 0; i < this.children.length; ++i) {
            var child = this.children[i];

            if (!child.visible) {
                continue;
            }

            var frame = child.texture.frame;

            context.globalAlpha = this.worldAlpha * child.alpha;

            if (child.rotation % (Math.PI * 2) === 0) {
                // this is the fastest  way to optimise! - if rotation is 0 then we can avoid any kind of setTransform call
                if (isRotated) {
                    context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx * renderer.resolution, transform.ty * renderer.resolution);

                    isRotated = false;
                }

                positionX = child.anchor.x * (-frame.width * child.scale.x) + child.position.x + 0.5;
                positionY = child.anchor.y * (-frame.height * child.scale.y) + child.position.y + 0.5;

                finalWidth = frame.width * child.scale.x;
                finalHeight = frame.height * child.scale.y;
            } else {
                if (!isRotated) {
                    isRotated = true;
                }

                child.displayObjectUpdateTransform();

                var childTransform = child.worldTransform;

                if (renderer.roundPixels) {
                    context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx * renderer.resolution | 0, childTransform.ty * renderer.resolution | 0);
                } else {
                    context.setTransform(childTransform.a, childTransform.b, childTransform.c, childTransform.d, childTransform.tx * renderer.resolution, childTransform.ty * renderer.resolution);
                }

                positionX = child.anchor.x * -frame.width + 0.5;
                positionY = child.anchor.y * -frame.height + 0.5;

                finalWidth = frame.width;
                finalHeight = frame.height;
            }

            var resolution = child.texture.baseTexture.resolution;

            context.drawImage(child.texture.baseTexture.source, frame.x * resolution, frame.y * resolution, frame.width * resolution, frame.height * resolution, positionX * resolution, positionY * resolution, finalWidth * resolution, finalHeight * resolution);
        }
    };

    /**
     * Destroys the container
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     */


    ParticleContainer.prototype.destroy = function destroy(options) {
        _core$Container.prototype.destroy.call(this, options);

        if (this._buffers) {
            for (var i = 0; i < this._buffers.length; ++i) {
                this._buffers[i].destroy();
            }
        }

        this._properties = null;
        this._buffers = null;
    };

    return ParticleContainer;
}(core.Container);

exports.default = ParticleContainer;
//# sourceMappingURL=ParticleContainer.js.map