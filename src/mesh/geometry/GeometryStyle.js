export default class GeometryStyle
{
    constructor()
    {
        this.attributes = {};

        this.indexBuffer = null;
    }

    addAttribute(id, attribute)
    {
        this.attributes[id] = attribute;

        return this;
    }

    addIndex(buffer)
    {
        this.indexBuffer = buffer;

        return this;
    }

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

        console.log(map)

        return map;
    }

    destroy()
    {
        this.attributes = null;

        this.indexBuffer = null;
    }
}