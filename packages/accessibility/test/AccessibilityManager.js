const { AccessibilityManager } = require('../');

describe('PIXI.accessibility.AccessibilityManager', function ()
{
    it('should exist', function ()
    {
        expect(AccessibilityManager).to.be.not.undefined;
    });

    it('should create new manager', function ()
    {
        const manager = new AccessibilityManager();

        expect(manager).to.be.instanceof(AccessibilityManager);
        manager.destroy();
    });
});
