let UID = 0;
/**
 * Helper class to create a webGL buffer
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param type {gl.ARRAY_BUFFER | gl.ELEMENT_ARRAY_BUFFER} @mat
 * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data
 * @param drawType {gl.STATIC_DRAW|gl.DYNAMIC_DRAW|gl.STREAM_DRAW}
 */
export default class Buffer
{
    constructor(data)
    {
        /**
         * The type of the buffer
         *
         * @member {gl.ARRAY_BUFFER|gl.ELEMENT_ARRAY_BUFFER}
         */
        // this.type = type || gl.ARRAY_BUFFER;

        /**
         * The draw type of the buffer
         *
         * @member {gl.STATIC_DRAW|gl.DYNAMIC_DRAW|gl.STREAM_DRAW}
         */
        // this.drawType = drawType || gl.STATIC_DRAW;

        /**
         * The data in the buffer, as a typed array
         *
         * @member {ArrayBuffer| SharedArrayBuffer|ArrayBufferView}
         */
        this.data = data;

        this._glBuffers = [];

        this._updateID = 0;

        this.id = UID++;
    }

    /**
     * Uploads the buffer to the GPU
     * @param data {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} an array of data to upload
     * @param offset {Number} if only a subset of the data should be uploaded, this is the amount of data to subtract
     */
    update()
    {
        this._updateID++;
    }

    /**
     * Destroys the buffer
     *
     */
    destroy()
    {
        for (let i = 0; i < this._glBuffers.length; i++)
        {
            this._glBuffers[i].destroy();
        }

        this.data = null;
    }

    static from(data)
    {
        if(data instanceof Array)
        {
            data = new Float32Array(data);
        }
        return new Buffer(data);
    }
}

