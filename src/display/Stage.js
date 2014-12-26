var math = require('../math'),
    utils = require('../utils'),
    DisplayObjectContainer = require('./DisplayObjectContainer'),
    InteractionManager = require('../interaction/InteractionManager');

/**
 * A Stage represents the root of the display tree. Everything connected to the stage is rendered, but
 * the stage itself cannot be transformed. If you want to transform everything within a stage use a single
 * DOC as a child of the stage and transform that one.
 *
 * Creating a stage is a mandatory process when you use Pixi, which is as simple as this:
 *
 * ```js
 * var stage = new Stage(0xFFFFFF);
 * ```
 *
 * Where the parameter given is the background colour of the stage. You will use this stage instance to
 * add your sprites to it and therefore to the renderer. Here is how to add a sprite to the stage:
 *
 * ```js
 * stage.addChild(sprite);
 * ```
 *
 * @class
 * @extends DisplayObjectContainer
 * @namespace PIXI
 * @param backgroundColor {number} the background color of the stage, e.g.: 0xFFFFFF for white
 */
function Stage(backgroundColor) {
    DisplayObjectContainer.call(this);

    /**
     * Current transform of the object based on world (parent) factors
     *
     * @member {Matrix}
     * @readonly
     * @private
     */
    this.worldTransform = new math.Matrix();

    /**
     * Whether or not the stage is interactive
     *
     * @member {boolean}
     */
    this.interactive = true;

    /**
     * The interaction manage for this stage, manages all interactive activity on the stage
     *
     * @member {InteractionManager}
     */
    this.interactionManager = new InteractionManager(this);

    /**
     * Whether the stage is dirty and needs to have interactions updated
     *
     * @member {boolean}
     * @private
     */
    this.dirty = true;

    //the stage is its own stage
    this.stage = this;

    //optimize hit detection a bit
    this.stage.hitArea = new math.Rectangle(0, 0, 100000, 100000);

    this.setBackgroundColor(backgroundColor);
};

// constructor
Stage.prototype = Object.create(DisplayObjectContainer.prototype);
Stage.prototype.constructor = Stage;

/**
 * Sets another DOM element which can receive mouse/touch interactions instead of the default Canvas element.
 * This is useful for when you have other DOM elements on top of the Canvas element.
 *
 * @param domElement {DOMElement} This new domElement which will receive mouse/touch events
 */
Stage.prototype.setInteractionDelegate = function (domElement) {
    this.interactionManager.setTargetDomElement(domElement);
};

/*
 * Updates the object transform for rendering
 *
 * @method updateTransform
 * @private
 */
Stage.prototype.updateTransform = function () {
    this.worldAlpha = 1;

    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].updateTransform();
    }

    if (this.dirty) {
        this.dirty = false;

        // update interactive!
        this.interactionManager.dirty = true;
    }

    if (this.interactive) {
        this.interactionManager.update();
    }
};

/**
 * Sets the background color for the stage
 *
 * @param backgroundColor {number} The color of the background, e.g.: 0xFFFFFF for white
 */
Stage.prototype.setBackgroundColor = function (backgroundColor) {
    this.backgroundColor = backgroundColor || 0x000000;
    this.backgroundColorSplit = utils.hex2rgb(this.backgroundColor);

    var hex = this.backgroundColor.toString(16);
    hex = '000000'.substr(0, 6 - hex.length) + hex;

    this.backgroundColorString = '#' + hex;
};

/**
 * This will return the point containing global coordinates of the mouse.
 *
 * @return {Point} A point containing the coordinates of the global InteractionData position.
 */
Stage.prototype.getMousePosition = function () {
    return this.interactionManager.mouse.global;
};
