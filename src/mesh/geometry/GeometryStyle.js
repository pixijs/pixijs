/**
 * GeometryStyle represents the structure of the geometry such as the attributes layout.
 *
 * ```js
 * let geometryStyle = new PIXI.GeometryStyle();
 *
 * geometryStyle.addAttribute('positions, new PIXI.Attribute('positionBuffer', 2));
 * geometryStyle.addAttribute('uvs', new PIXI.Attribute('uvsBuffer', 2);
 *
 * ```
 * @class
 * @memberof PIXI.GeometryStyle
 */
export default class GeometryStyle
{
    /**
     *
     */
    constructor()
    {
        /**
         * key-value pair contains all the attributes for this style
         *
         * @member {Object}
         */
        this.attributes = {};
    }

    // TODO rename this to add?

    /**
    *
    * Adds an attribute to the geometryStyle
    *
    * @param {String} id - the name of the attribute (matching up to a shader)
    * @param {PIXI.Attribute} [attribute] the Attribute that you would like to add to the style.
    *
    * @return {PIXI.GeometryStyle} returns self, useful for chaining.
    */
    addAttribute(id, attribute)
    {
        this.attributes[id] = attribute;

        return this;
    }

    /**
     * generates a map of what the locations of the attributes will be.
     * All attributes locations are assigned in alphabetical order just like the {PIXI.Shader} attribute locations.
     * This ensures that all geometries and shaders will be compatible if they have the same attributes.
     *
     * @private
     * @return {object} map with key-value pairs mapping attribute names to locations (ints).
     */
    generateAttributeLocations()
    {
        const array = [];
        let i;

        for (i in this.attributes)
        {
            array.push(i);
        }

        array.sort();

        const map = {};

        for (i = 0; i < array.length; i++)
        {
            map[array[i]] = i;
        }

        return map;
    }

    /**
     * Destroys the geometryStyle.
     */
    destroy()
    {
        this.attributes = null;
    }
}
