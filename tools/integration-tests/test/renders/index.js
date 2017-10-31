const { Renderer } = require('@internal/renders');
const path = require('path');

// TODO: disable for now until we get the canvas version up and running again!
describe.skip('renders', function ()
{
    before(function ()
    {
        this.renderer = new Renderer();
        this.validate = function (id, done)
        {
            const code = path.join(__dirname, 'tests', `${id}.js`);
            const solution = path.join(__dirname, 'solutions', `${id}.json`);

            this.renderer.compare(code, solution, (err, success) =>
            {
                if (err)
                {
                    assert(false, err.message);
                }
                assert(success, 'Render not successful');
                done();
            });
        };
    });

    beforeEach(function ()
    {
        this.renderer.clear();
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
        this.validate = null;
    });

    it('should draw a rectangle', function (done)
    {
        this.validate('graphics-rect', done);
    });

    it('should draw a sprite', function (done)
    {
        this.validate('sprite-new', done);
    });
});
