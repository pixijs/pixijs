import GroupD8 from '../math/GroupD8';

/**
 * A standard object to store the Uvs of a texture
 *
 * @class
 * @private
 * @memberof PIXI
 */
export default class TextureUvs
{
    /**
     *
     */
    constructor()
    {
        this.x0 = 0;
        this.y0 = 0;

        this.x1 = 1;
        this.y1 = 0;

        this.x2 = 1;
        this.y2 = 1;

        this.x3 = 0;
        this.y3 = 1;

        this.uvsUint32 = new Uint32Array(4);
    }

    /**
     * Sets the texture Uvs based on the given frame information.
     *
     * @private
     * @param {PIXI.Rectangle} frame - The frame of the texture
     * @param {PIXI.Rectangle} baseFrame - The base frame of the texture
     * @param {number} rotate - Rotation of frame, see {@link PIXI.GroupD8}
     */
    set(frame, baseFrame, rotate)
    {
        const tw = baseFrame.width;
        const th = baseFrame.height;

        if (rotate)
        {
            // width and height div 2 div baseFrame size
            const w2 = frame.width / 2 / tw;
            const h2 = frame.height / 2 / th;

            // coordinates of center
            const cX = (frame.x / tw) + w2;
            const cY = (frame.y / th) + h2;

            rotate = GroupD8.add(rotate, GroupD8.NW); // NW is top-left corner
            this.x0 = cX + (w2 * GroupD8.uX(rotate));
            this.y0 = cY + (h2 * GroupD8.uY(rotate));

            rotate = GroupD8.add(rotate, 2); // rotate 90 degrees clockwise
            this.x1 = cX + (w2 * GroupD8.uX(rotate));
            this.y1 = cY + (h2 * GroupD8.uY(rotate));

            rotate = GroupD8.add(rotate, 2);
            this.x2 = cX + (w2 * GroupD8.uX(rotate));
            this.y2 = cY + (h2 * GroupD8.uY(rotate));

            rotate = GroupD8.add(rotate, 2);
            this.x3 = cX + (w2 * GroupD8.uX(rotate));
            this.y3 = cY + (h2 * GroupD8.uY(rotate));
        }
        else
        {
            this.x0 = frame.x / tw;
            this.y0 = frame.y / th;

            this.x1 = (frame.x + frame.width) / tw;
            this.y1 = frame.y / th;

            this.x2 = (frame.x + frame.width) / tw;
            this.y2 = (frame.y + frame.height) / th;

            this.x3 = frame.x / tw;
            this.y3 = (frame.y + frame.height) / th;
        }

        this.uvsUint32[0] = (((this.y0 * 65535) & 0xFFFF) << 16) | ((this.x0 * 65535) & 0xFFFF);
        this.uvsUint32[1] = (((this.y1 * 65535) & 0xFFFF) << 16) | ((this.x1 * 65535) & 0xFFFF);
        this.uvsUint32[2] = (((this.y2 * 65535) & 0xFFFF) << 16) | ((this.x2 * 65535) & 0xFFFF);
        this.uvsUint32[3] = (((this.y3 * 65535) & 0xFFFF) << 16) | ((this.x3 * 65535) & 0xFFFF);
    }
}
