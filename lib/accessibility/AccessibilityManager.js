'use strict';

exports.__esModule = true;

var _core = require('../core');

var core = _interopRequireWildcard(_core);

var _ismobilejs = require('ismobilejs');

var _ismobilejs2 = _interopRequireDefault(_ismobilejs);

var _accessibleTarget = require('./accessibleTarget');

var _accessibleTarget2 = _interopRequireDefault(_accessibleTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// add some extra variables to the container..
Object.assign(core.DisplayObject.prototype, _accessibleTarget2.default);

var KEY_CODE_TAB = 9;

var DIV_TOUCH_SIZE = 100;
var DIV_TOUCH_POS_X = 0;
var DIV_TOUCH_POS_Y = 0;
var DIV_TOUCH_ZINDEX = 2;

var DIV_HOOK_SIZE = 1;
var DIV_HOOK_POS_X = -1000;
var DIV_HOOK_POS_Y = -1000;
var DIV_HOOK_ZINDEX = 2;

/**
 * The Accessibility manager reacreates the ability to tab and and have content read by screen
 * readers. This is very important as it can possibly help people with disabilities access pixi
 * content.
 *
 * Much like interaction any DisplayObject can be made accessible. This manager will map the
 * events as if the mouse was being used, minimizing the efferot required to implement.
 *
 * @class
 * @memberof PIXI
 */

var AccessibilityManager = function () {
    /**
     * @param {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    function AccessibilityManager(renderer) {
        _classCallCheck(this, AccessibilityManager);

        if ((_ismobilejs2.default.tablet || _ismobilejs2.default.phone) && !navigator.isCocoonJS) {
            this.createTouchHook();
        }

        // first we create a div that will sit over the pixi element. This is where the div overlays will go.
        var div = document.createElement('div');

        div.style.width = DIV_TOUCH_SIZE + 'px';
        div.style.height = DIV_TOUCH_SIZE + 'px';
        div.style.position = 'absolute';
        div.style.top = DIV_TOUCH_POS_X + 'px';
        div.style.left = DIV_TOUCH_POS_Y + 'px';
        div.style.zIndex = DIV_TOUCH_ZINDEX;

        /**
         * This is the dom element that will sit over the pixi element. This is where the div overlays will go.
         *
         * @type {HTMLElement}
         * @private
         */
        this.div = div;

        /**
         * A simple pool for storing divs.
         *
         * @type {*}
         * @private
         */
        this.pool = [];

        /**
         * This is a tick used to check if an object is no longer being rendered.
         *
         * @type {Number}
         * @private
         */
        this.renderId = 0;

        /**
         * Setting this to true will visually show the divs
         *
         * @type {boolean}
         */
        this.debug = false;

        /**
         * The renderer this accessibility manager works for.
         *
         * @member {PIXI.SystemRenderer}
         */
        this.renderer = renderer;

        /**
         * The array of currently active accessible items.
         *
         * @member {Array<*>}
         * @private
         */
        this.children = [];

        /**
         * pre-bind the functions
         *
         * @private
         */
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);

        /**
         * stores the state of the manager. If there are no accessible objects or the mouse is moving the will be false.
         *
         * @member {Array<*>}
         * @private
         */
        this.isActive = false;
        this.isMobileAccessabillity = false;

        // let listen for tab.. once pressed we can fire up and show the accessibility layer
        window.addEventListener('keydown', this._onKeyDown, false);
    }

    /**
     * Creates the touch hooks.
     *
     */


    AccessibilityManager.prototype.createTouchHook = function createTouchHook() {
        var _this = this;

        var hookDiv = document.createElement('button');

        hookDiv.style.width = DIV_HOOK_SIZE + 'px';
        hookDiv.style.height = DIV_HOOK_SIZE + 'px';
        hookDiv.style.position = 'absolute';
        hookDiv.style.top = DIV_HOOK_POS_X + 'px';
        hookDiv.style.left = DIV_HOOK_POS_Y + 'px';
        hookDiv.style.zIndex = DIV_HOOK_ZINDEX;
        hookDiv.style.backgroundColor = '#FF0000';
        hookDiv.title = 'HOOK DIV';

        hookDiv.addEventListener('focus', function () {
            _this.isMobileAccessabillity = true;
            _this.activate();
            document.body.removeChild(hookDiv);
        });

        document.body.appendChild(hookDiv);
    };

    /**
     * Activating will cause the Accessibility layer to be shown. This is called when a user
     * preses the tab key
     *
     * @private
     */


    AccessibilityManager.prototype.activate = function activate() {
        if (this.isActive) {
            return;
        }

        this.isActive = true;

        window.document.addEventListener('mousemove', this._onMouseMove, true);
        window.removeEventListener('keydown', this._onKeyDown, false);

        this.renderer.on('postrender', this.update, this);

        if (this.renderer.view.parentNode) {
            this.renderer.view.parentNode.appendChild(this.div);
        }
    };

    /**
     * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves
     * the mouse
     *
     * @private
     */


    AccessibilityManager.prototype.deactivate = function deactivate() {
        if (!this.isActive || this.isMobileAccessabillity) {
            return;
        }

        this.isActive = false;

        window.document.removeEventListener('mousemove', this._onMouseMove);
        window.addEventListener('keydown', this._onKeyDown, false);

        this.renderer.off('postrender', this.update);

        if (this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
        }
    };

    /**
     * This recursive function will run throught he scene graph and add any new accessible objects to the DOM layer.
     *
     * @private
     * @param {PIXI.Container} displayObject - The DisplayObject to check.
     */


    AccessibilityManager.prototype.updateAccessibleObjects = function updateAccessibleObjects(displayObject) {
        if (!displayObject.visible) {
            return;
        }

        if (displayObject.accessible && displayObject.interactive) {
            if (!displayObject._accessibleActive) {
                this.addChild(displayObject);
            }

            displayObject.renderId = this.renderId;
        }

        var children = displayObject.children;

        for (var i = children.length - 1; i >= 0; i--) {
            this.updateAccessibleObjects(children[i]);
        }
    };

    /**
     * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
     *
     * @private
     */


    AccessibilityManager.prototype.update = function update() {
        if (!this.renderer.renderingToScreen) {
            return;
        }

        // update children...
        this.updateAccessibleObjects(this.renderer._lastObjectRendered);

        var rect = this.renderer.view.getBoundingClientRect();
        var sx = rect.width / this.renderer.width;
        var sy = rect.height / this.renderer.height;

        var div = this.div;

        div.style.left = rect.left + 'px';
        div.style.top = rect.top + 'px';
        div.style.width = this.renderer.width + 'px';
        div.style.height = this.renderer.height + 'px';

        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            if (child.renderId !== this.renderId) {
                child._accessibleActive = false;

                core.utils.removeItems(this.children, i, 1);
                this.div.removeChild(child._accessibleDiv);
                this.pool.push(child._accessibleDiv);
                child._accessibleDiv = null;

                i--;

                if (this.children.length === 0) {
                    this.deactivate();
                }
            } else {
                // map div to display..
                div = child._accessibleDiv;
                var hitArea = child.hitArea;
                var wt = child.worldTransform;

                if (child.hitArea) {
                    div.style.left = (wt.tx + hitArea.x * wt.a) * sx + 'px';
                    div.style.top = (wt.ty + hitArea.y * wt.d) * sy + 'px';

                    div.style.width = hitArea.width * wt.a * sx + 'px';
                    div.style.height = hitArea.height * wt.d * sy + 'px';
                } else {
                    hitArea = child.getBounds();

                    this.capHitArea(hitArea);

                    div.style.left = hitArea.x * sx + 'px';
                    div.style.top = hitArea.y * sy + 'px';

                    div.style.width = hitArea.width * sx + 'px';
                    div.style.height = hitArea.height * sy + 'px';
                }
            }
        }

        // increment the render id..
        this.renderId++;
    };

    /**
     * TODO: docs.
     *
     * @param {Rectangle} hitArea - TODO docs
     */


    AccessibilityManager.prototype.capHitArea = function capHitArea(hitArea) {
        if (hitArea.x < 0) {
            hitArea.width += hitArea.x;
            hitArea.x = 0;
        }

        if (hitArea.y < 0) {
            hitArea.height += hitArea.y;
            hitArea.y = 0;
        }

        if (hitArea.x + hitArea.width > this.renderer.width) {
            hitArea.width = this.renderer.width - hitArea.x;
        }

        if (hitArea.y + hitArea.height > this.renderer.height) {
            hitArea.height = this.renderer.height - hitArea.y;
        }
    };

    /**
     * Adds a DisplayObject to the accessibility manager
     *
     * @private
     * @param {DisplayObject} displayObject - The child to make accessible.
     */


    AccessibilityManager.prototype.addChild = function addChild(displayObject) {
        //    this.activate();

        var div = this.pool.pop();

        if (!div) {
            div = document.createElement('button');

            div.style.width = DIV_TOUCH_SIZE + 'px';
            div.style.height = DIV_TOUCH_SIZE + 'px';
            div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
            div.style.position = 'absolute';
            div.style.zIndex = DIV_TOUCH_ZINDEX;
            div.style.borderStyle = 'none';

            div.addEventListener('click', this._onClick.bind(this));
            div.addEventListener('focus', this._onFocus.bind(this));
            div.addEventListener('focusout', this._onFocusOut.bind(this));
        }

        if (displayObject.accessibleTitle) {
            div.title = displayObject.accessibleTitle;
        } else if (!displayObject.accessibleTitle && !displayObject.accessibleHint) {
            div.title = 'displayObject ' + this.tabIndex;
        }

        if (displayObject.accessibleHint) {
            div.setAttribute('aria-label', displayObject.accessibleHint);
        }

        //

        displayObject._accessibleActive = true;
        displayObject._accessibleDiv = div;
        div.displayObject = displayObject;

        this.children.push(displayObject);
        this.div.appendChild(displayObject._accessibleDiv);
        displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
    };

    /**
     * Maps the div button press to pixi's InteractionManager (click)
     *
     * @private
     * @param {MouseEvent} e - The click event.
     */


    AccessibilityManager.prototype._onClick = function _onClick(e) {
        var interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
    };

    /**
     * Maps the div focus events to pixis InteractionManager (mouseover)
     *
     * @private
     * @param {FocusEvent} e - The focus event.
     */


    AccessibilityManager.prototype._onFocus = function _onFocus(e) {
        var interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
    };

    /**
     * Maps the div focus events to pixis InteractionManager (mouseout)
     *
     * @private
     * @param {FocusEvent} e - The focusout event.
     */


    AccessibilityManager.prototype._onFocusOut = function _onFocusOut(e) {
        var interactionManager = this.renderer.plugins.interaction;

        interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
    };

    /**
     * Is called when a key is pressed
     *
     * @private
     * @param {KeyboardEvent} e - The keydown event.
     */


    AccessibilityManager.prototype._onKeyDown = function _onKeyDown(e) {
        if (e.keyCode !== KEY_CODE_TAB) {
            return;
        }

        this.activate();
    };

    /**
     * Is called when the mouse moves across the renderer element
     *
     * @private
     */


    AccessibilityManager.prototype._onMouseMove = function _onMouseMove() {
        this.deactivate();
    };

    /**
     * Destroys the accessibility manager
     *
     */


    AccessibilityManager.prototype.destroy = function destroy() {
        this.div = null;

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].div = null;
        }

        window.document.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('keydown', this._onKeyDown);

        this.pool = null;
        this.children = null;
        this.renderer = null;
    };

    return AccessibilityManager;
}();

exports.default = AccessibilityManager;


core.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
core.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);
//# sourceMappingURL=AccessibilityManager.js.map