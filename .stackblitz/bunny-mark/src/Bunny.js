import * as PIXI from 'pixi.js';

export class Bunny extends PIXI.Sprite
{
    gravity = 0.75;
    speedX = Math.random() * 10;
    speedY = (Math.random() * 10) - 5;
    sceneBounds;

    constructor(view, sceneBounds)
    {
        super(view);
        this.sceneBounds = sceneBounds;
    }

    update()
    {
        let pX = this.position.x;
        let pY = this.position.y;

        pX += this.speedX;
        pY += this.speedY;
        this.speedY += this.gravity;

        if (pX > this.sceneBounds.right)
        {
            this.speedX *= -1;
            pX = this.sceneBounds.right;
        }
        else if (pX < this.sceneBounds.left)
        {
            this.speedX *= -1;
            pX = this.sceneBounds.left;
        }

        if (pY > this.sceneBounds.bottom)
        {
            this.speedY *= -0.85;
            pY = this.sceneBounds.bottom;
            if (Math.random() > 0.5)
            {
                this.speedY -= Math.random() * 6;
            }
        }
        else if (pY < this.sceneBounds.top)
        {
            this.speedY = 0;
            pY = this.sceneBounds.top;
        }

        this.position.x = pX;
        this.position.y = pY;
    }

    /**
     * Don't use after this.
     * @param options
     */
    destroy(options)
    {
        this.sceneBounds = null;
        super.destroy(options);
    }
}
