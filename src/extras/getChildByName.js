var DisplayObject = require('../core/display/DisplayObject'),
    Container = require('../core/display/Container');

/**
 * The instance name of the object.
 *
 * @member {string}
 */
DisplayObject.prototype.name = null;

/**
* Returns the display object in the container
*
* @param name {string} instance name
* @return {DisplayObject}
*/
Container.prototype.getChildByName = function (name)
{
    for (var i = 0; i < this.children.length; i++) 
    {
        if (this.children[i].name === name) 
        {
            return this.children[i];
        }
    }
    return null;
};

module.exports = {};