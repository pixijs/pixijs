/**
 * @class
 * @memberof PIXI
 */
export default class SpriteArrayTexture
{
    /**
     * @param {number} size - The size of the buffer in bytes.
     */
    constructor(width = 2048, height = 2048, depth = 10)
    {
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.dirty = false;
        this.textures = [];

        this.spriteTextures = []; // collection of sprite textures
    }

    addSprite(id, frame, texture)
    {
        const sprite = new SpriteTexture(this, frame);
        this.spriteTextures.push(sprite);
    }

    add(texture) // or texture...
    {
        // add a base texture...
        this.dirty = true;

        this.texture.push({texture, x:0, y:0, z:0});

        // find a slot!
    }

    resize()
    {

    }

    /**
     * Destroys the buffer.
     *
     */
    destroy()
    {
    }
}
