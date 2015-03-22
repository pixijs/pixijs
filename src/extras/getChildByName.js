var core = require('../core');

/**
 * The instance name of the object.
 *
 * @member {string}
 */
core.DisplayObject.prototype.name = null;

/**
* Returns the display object in the container
*
* @param name {string} instance name
* @return {DisplayObject}
*/
core.Container.prototype.getChildByName = function (name)
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
