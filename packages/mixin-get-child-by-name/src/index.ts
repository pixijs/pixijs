import { DisplayObject, Container } from '@pixi/display';

/**
 * The instance name of the object.
 *
 * @memberof PIXI.DisplayObject#
 * @member {string} name
 */
DisplayObject.prototype.name = null;

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
Container.prototype.getChildByName = function getChildByName(name: string, deep?: boolean): DisplayObject
{
    for (let i = 0, j = this.children.length; i < j; i++)
    {
        if (this.children[i].name === name)
        {
            return this.children[i];
        }
    }

    if (deep)
    {
        for (let i = 0, j = this.children.length; i < j; i++)
        {
            const child = (this.children[i] as Container);

            if (!child.getChildByName)
            {
                continue;
            }

            const target = (this.children[i] as Container).getChildByName(name, true);

            if (target)
            {
                return target;
            }
        }
    }

    return null;
};
