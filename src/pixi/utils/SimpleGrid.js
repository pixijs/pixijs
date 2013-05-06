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
	PIXI.Layers.call(this);

	this._width = widthPower || 10;
	this._height = heightPower || 10;
};

PIXI.SimpleGrid.constructor = PIXI.SimpleGrid;
PIXI.SimpleGrid.prototype = Object.create(PIXI.Layers.prototype);


PIXI.SimpleGrid.prototype.getCellСoordinates = function (displayObject) {
	return {
		x: displayObject.position.x >> this._width,
		y: displayObject.position.y >> this._height
	};
};

PIXI.SimpleGrid.prototype.getCellName = function (displayObject) {
	var coords = this.getCellСoordinates(displayObject);
	return coords.x + "_" + coords.y;
};

/**
 * Add child to one of the grid cells
 * @method addChild
 * @param  displayObject {DisplayObject}
 * @return DisplayObject
 */
PIXI.SimpleGrid.prototype.addChild = function (displayObject) {
	// Wrap position property of displayObject
	// Rewrap PIXI.Point object

	this.getLayer(this.getCellName(displayObject)).addChild(displayObject);
};

PIXI.SimpleGrid.prototype.getSurroundCells = function (displayObject) {
	var coords = this.getCellСoordinates(displayObject);
	return [
	// TOP ROW
	this[(coords.x - 1) + "_" + (coords.y - 1)],
	this[(coords.x) + "_" + (coords.y - 1)],
	this[(coords.x + 1) + "_" + (coords.y - 1)],
	// MIDDLE ROW
	this[(coords.x - 1) + "_" + (coords.y)],
	this[(coords.x) + "_" + (coords.y)],
	this[(coords.x + 1) + "_" + (coords.y)],
	// BOTTOM ROW
	this[(coords.x - 1) + "_" + (coords.y + 1)],
	this[(coords.x) + "_" + (coords.y + 1)],
	this[(coords.x + 1) + "_" + (coords.y + 1)]];
};