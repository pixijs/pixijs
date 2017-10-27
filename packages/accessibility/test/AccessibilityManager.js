const { AccessibilityManager } = require('../');
const { CanvasRenderer } = require('@pixi/core');

describe('PIXI.accessibility.AccessibilityManager', function()
{
    it('should exist', function()
    {
        expect(AccessibilityManager).to.be.not.undefined;
    });

    it('should create new manager', function()
    {
        const manager = new AccessibilityManager();
        expect(manager).to.be.instanceof(AccessibilityManager);
        manager.destroy();
    });

    it('should be plugin for renderer', function()
    {
        const renderer = new CanvasRenderer();
        expect(renderer.plugins.accessibility).to.be.instanceof(AccessibilityManager);
        renderer.destroy();
    });
});
