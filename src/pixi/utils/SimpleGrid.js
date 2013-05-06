/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
 *
 * @class SimpleGrid provides easy object storing in different DisplayObjectContainers
 * grouped by theris position. It should simplify partial rendering and collisions.
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.SimpleGrid = function (width, height) {

	this._width = width;
	this._height = height;

	throw new Error("Not implemented yet!");
};

PIXI.SimpleGrid.constructor = PIXI.SimpleGrid;
PIXI.SimpleGrid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Add child to one of the grid cells
 * @method addChild
 * @param  displayObject {DisplayObject}
 * @return DisplayObject
 */
PIXI.SimpleGrid.prototype.addChild = function (displayObject) {
	throw new Error("Not implemented yet!");
};