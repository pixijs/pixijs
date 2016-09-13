let WebGLManager = require('./WebGLManager');

/**
 * @class
 * @memberof PIXI
 * @extends PIXI.WebGLManager
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
class BlendModeManager extends WebGLManager {
    constructor(renderer)
    {
        super(renderer);

        /**
         * @member {number}
         */
        this.currentBlendMode = 99999;
    }

    /**
     * Sets-up the given blendMode from WebGL's point of view.
     *
     * @param blendMode {number} the blendMode, should be a Pixi const, such as `PIXI.BLEND_MODES.ADD`. See
     *  {@link PIXI.BLEND_MODES} for possible values.
     */
    setBlendMode(blendMode)
    {
        if (this.currentBlendMode === blendMode)
        {
            return false;
        }

        this.currentBlendMode = blendMode;

        let mode = this.renderer.blendModes[this.currentBlendMode];
        this.renderer.gl.blendFunc(mode[0], mode[1]);

        return true;
    }

}

module.exports = BlendModeManager;
