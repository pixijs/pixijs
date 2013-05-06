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
PIXI.SimpleGrid = function (widthPower, heightPower) {

	this._width = widthPower;
	this._height = heightPower;

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
	var grid_x = displayObject.position.x >> this._width;
	var grid_y = displayObject.position.y >> this._height;

	this.cells.get(grid_x + "_" + grid_y).addChild(displayObject);
};