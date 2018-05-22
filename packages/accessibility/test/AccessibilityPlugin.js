const { AccessibilityManager, AccessibilityPlugin } = require('../');

describe('PIXI.accessibility.AccessibilityPlugin', function ()
{
    it('should create accessibility', function ()
    {
        const app = {};

        AccessibilityPlugin.init.call(app);

        expect(app.accessibility).to.be.instanceof(AccessibilityManager);

        AccessibilityPlugin.destroy.call(app);

        expect(app.accessibility).to.be.null;
    });
});
