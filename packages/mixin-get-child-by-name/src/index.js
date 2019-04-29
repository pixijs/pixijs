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
 * @method getChildByName
 * @memberof PIXI.Container#
 * @param {string} name - Instance name.
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

/**
 * Add reference by name from children in child.
 *
 * @method childrenToName
 * @memberof PIXI.Container#
 * @return {Object.keys} Keys name.
 */
Container.prototype.childrenToName = function childrenToName()
{   
    this.child = {}; // clear
    for (let i = 0; i < this.children.length; i++){
        const name = this.children[i].name;
        if(name){
            if(object1.hasOwnProperty(name)){ throw console.error(`Conflic name alrealy exist ${name}`,this) };
            this.child[name] = this.children[i]; // ref obj
        }
    };
    return Object.keys(this.child);
};
