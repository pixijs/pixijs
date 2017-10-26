/**
 * @class
 * @memberof PIXI
 */
export default class Buffer
{
    /**
     * @param {number} size - The size of the buffer in bytes.
     */
    constructor(size)
    {
        this.vertices = new ArrayBuffer(size);

        /**
         * View on the vertices as a Float32Array for positions
         *
         * @member {Float32Array}
         */
        this.float32View = new Float32Array(this.vertices);

        /**
         * View on the vertices as a Uint32Array for uvs
         *
         * @member {Float32Array}
         */
        this.uint32View = new Uint32Array(this.vertices);
    }

    /**
     * Destroys the buffer.
     *
     */
    destroy()
    {
        this.vertices = null;
        this.positions = null;
        this.uvs = null;
        this.colors = null;
    }
}
