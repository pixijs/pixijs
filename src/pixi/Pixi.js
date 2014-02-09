/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * @module PIXI
 */
var PIXI = PIXI || {};

PIXI.WEBGL_RENDERER = 0;
PIXI.CANVAS_RENDERER = 1;

// useful for testing against if your lib is using pixi.
PIXI.VERSION = "v1.4.4";

// the various blend modes supported by pixi
PIXI.blendModes = {
    NORMAL:0,
    ADD:1,
    MULTIPLY:2,
    SCREEN:3,
    OVERLAY:4,
    DARKEN:5,
    LIGHTEN:6,
    COLOR_DODGE:7,
    COLOR_BURN:8,
    HARD_LIGHT:9,
    SOFT_LIGHT:10,
    DIFFERENCE:11,
    EXCLUSION:12,
    HUE:13,
    SATURATION:14,
    COLOR:15,
    LUMINOSITY:16
};

// the scale modes
PIXI.scaleModes = {
    DEFAULT:0,
    LINEAR:0,
    NEAREST:1
};

//  Canvas specific controls
PIXI.canvas = {

    //  If the Stage is NOT transparent Pixi will use a canvas sized fillRect operation every frame to set the canvas background color.
    //  Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
    FILL_RECT: true,

    //  If the Stage is transparent Pixi will use clearRect to clear the canvas every frame.
    //  Disable this by setting this to false. For example if your game has a canvas filling background image you often don't need this set.
    CLEAR_RECT: true,

    //  If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation. Handy for crisp pixel art and speed on legacy devices.
    PX_ROUND: false
}

// interaction frequency 
PIXI.INTERACTION_FREQUENCY = 30;
PIXI.AUTO_PREVENT_DEFAULT = true;