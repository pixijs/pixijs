const { InteractionPlugin, InteractionManager } = require('../');

describe('PIXI.InteractionPlugin', function ()
{
    it('should create and destroy plugin', function ()
    {
        const app = {
            renderer: {
                resolution: 1,
            },
        };

        InteractionPlugin.init.call(app);

        expect(app.interaction).to.be.instanceof(InteractionManager);

        InteractionPlugin.destroy.call(app);

        expect(app.interaction).to.be.null;
    });

    it('should disable interaction', function ()
    {
        const app = {};

        InteractionPlugin.init.call(app, { interaction: false });

        expect(app.interaction).to.be.null;
    });
});

