/**
 * @author Vsevolod Strukchinsky @floatdrop
 */


/**
 * A class Layers represents a named collection of display objects container (layers). It is the base class of all display objects that act as a container for other objects.
 * Example call: var layers = new PIXI.Layers("bottom", "middle", "top"); // Create three layers, that can be getted by layers.top, layers.middle, layers.bottom
 * @class Layers
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.Layers = function () {
	PIXI.DisplayObjectContainer.call(this);

	this.blockedNames = Object.keys(this);

	for (var argumentIndex in arguments) {
		var arg = arguments[argumentIndex];
		if (typeof arg === "string") {
			this.addLayer(arg);
		} else if (arg instanceof Object) {
			for (var layersGroupName in arg) {
				this[layersGroupName] = arg[layersGroupName];
				this.addChild(arg[layersGroupName]);
			}
		}
	}
};

PIXI.Layers.constructor = PIXI.Layers;
PIXI.Layers.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Creates new layer with name layerName above others layers.
 * @method addLayer
 * @param  layerName {String}
 * @return DisplayObject
 */
PIXI.Layers.prototype.addLayer = function (layerName) {
	return this.addLayerAt(layerName, this.children.length);
};

/**
 * Creates new layer with name layerName at specified index.
 * @method addLayerAt
 * @param Layer {DisplayObject}
 * @param index {Number}
 */
PIXI.Layers.prototype.addLayerAt = function (layerName, index) {
	if (layerName in this) {
		throw new Error(layerName + " Suplied name already used by " + this.layers[layerName]);
	}
	var layer = new PIXI.DisplayObjectContainer();
	layer.layername = layerName;
	this.addChildAt(layer, index);
	this[layerName] = layer;
	return layer;
};

/**
 * Swaps 2 Layers
 * @method swapChildren
 * @param  LayerName {String}
 * @param  LayerName2 {String}
 */
PIXI.DisplayObjectContainer.prototype.swapLayers = function (layerName, layerName2) {

	var layer = this[layerName];
	var layer2 = this[layerName2];

	this.swapChildren(layer, layer2);
};

/**
 * Returns the Layer with specified name or creates it
 * @method getLayer
 * @param  layerName {String}
 * @return DisplayObjectContainer
 */
PIXI.DisplayObjectContainer.prototype.getLayer = function (layerName) {
	if (!this[layerName])
		this.addLayer(layerName);
	return this[layerName];
};

/**
 * Returns the Layer at the specified index
 * @method getLayerAt
 * @param  index {Number}
 * @return DisplayObjectContainer
 */
PIXI.DisplayObjectContainer.prototype.getLayerAt = function (index) {
	return this.getChildAt(index);
};

/**
 * Removes a layer from the container.
 * @method removeLayer
 * @param String {LayerName}
 */
PIXI.Layers.prototype.removeLayer = function (layerName) {
	if (!(layerName in this) || (layerName in this.blockedNames)) return;
	PIXI.DisplayObjectContainer.prototype.removeChild.call(this, this[layerName]);
	delete this[layerName];
};

/**
 * Removes a child from the container.
 * @method removeChild
 * @param  DisplayObject {DisplayObject}
 */
PIXI.Layers.prototype.removeChild = function (child) {
	if (child.layername && child.layername in this) {
		delete this[child.layername];
	}
	PIXI.DisplayObjectContainer.prototype.removeChild.call(this, child);
};