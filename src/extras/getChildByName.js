var DisplayObject = require('../core/display/DisplayObject'),
    Container = require('../core/display/Container')

/**
 * The instance name of the object.
 *
 * @member {string}
 */
DisplayObject.prototype.name = null;

/**
* Get
*
* @param name {string} the instance name
* @return {DisplayObject}
*/
Container.prototype.getChildByName = function (val)
{
    for (i = 0; i < this.children.length; i++) 
    {
        if (this.children[i].name === val) 
        {
            return this.children[i];
        }
    }
    return null;
};

module.exports = {};