import { DisplayObject, Container } from '@pixi/core';

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string}
 */
DisplayObject.prototype.name = null;

/**
 * Returns the display object in the container
 *
 * @memberof PIXI.Container#
 * @param {string} name - instance name
 * @return {PIXI.DisplayObject} The child with the specified name.
 */
Container.prototype.getChildByName = function getChildByName(name)
{
    for (let i = 0; i < this.children.length; i++)
    {
        if (this.children[i].name === name)
        {
            return this.children[i];
        }
    }

    return null;
};
