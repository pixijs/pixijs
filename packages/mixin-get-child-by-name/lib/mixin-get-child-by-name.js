/*!
 * @pixi/mixin-get-child-by-name - v5.3.2
 * Compiled Sat, 24 Oct 2020 23:11:24 UTC
 *
 * @pixi/mixin-get-child-by-name is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

var display = require('@pixi/display');

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string} name
 */
display.DisplayObject.prototype.name = null;
/**
 * Returns the display object in the container.
 *
 * Recursive searches are done in a preorder traversal.
 *
 * @method getChildByName
 * @memberof PIXI.Container#
 * @param {string} name - Instance name.
 * @param {boolean}[deep=false] - Whether to search recursively
 * @return {PIXI.DisplayObject} The child with the specified name.
 */
display.Container.prototype.getChildByName = function getChildByName(name, deep) {
    for (var i = 0, j = this.children.length; i < j; i++) {
        if (this.children[i].name === name) {
            return this.children[i];
        }
    }
    if (deep) {
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            if (!child.getChildByName) {
                continue;
            }
            var target = this.children[i].getChildByName(name, true);
            if (target) {
                return target;
            }
        }
    }
    return null;
};
//# sourceMappingURL=mixin-get-child-by-name.js.map
