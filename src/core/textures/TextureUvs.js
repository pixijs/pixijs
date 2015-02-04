var halfPI = Math.PI / 2,
    x, y;

function TextureUvs()
{
    this.x0 = 0;
    this.y0 = 0;

    this.x1 = 0;
    this.y1 = 0;

    this.x2 = 0;
    this.y2 = 0;

    this.x3 = 0;
    this.y3 = 0;
}

module.exports = TextureUvs;

TextureUvs.prototype.rotate = function (angle)
{
    if (!angle)
    {
        return;
    }

    // if not a multiple of (PI/2)
    if (angle % halfPI)
    {
        // TODO: Not a multiple of (PI/2)...
    }
    // shift values for multiples of (PI/2)
    else
    {
        // rotate the uvs by (PI/2) however many times are needed
        if (angle > 0)
        {
            for (var i = angle / halfPI; i > 0; --i)
            {
                x = this.x3;
                y = this.y3;

                this.x3 = this.x2;
                this.y3 = this.y2;

                this.x2 = this.x1;
                this.y2 = this.y1;

                this.x1 = this.x0;
                this.y1 = this.y0;

                this.x0 = x;
                this.y0 = y;
            }
        }
        // rotate the uvs by -(PI/2) however many times are needed
        else
        {
            for (var i = angle / halfPI; i < 0; ++i)
            {
                x = this.x0;
                y = this.y0;

                this.x0 = this.x1;
                this.y0 = this.y1;

                this.x1 = this.x2;
                this.y1 = this.y2;

                this.x2 = this.x3;
                this.y2 = this.y3;

                this.x3 = x;
                this.y3 = y;
            }
        }
    }
};
