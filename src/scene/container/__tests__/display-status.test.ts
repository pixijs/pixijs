import { Application } from '../../../app/Application';
import { Container } from '../Container';

describe('Container Display Status', () =>
{
    it('should update display status correctly for root containers', () =>
    {
        const root = new Container();

        // Initially, both local and global should be 0b111
        expect(root.localDisplayStatus).toBe(0b111);
        expect(root.globalDisplayStatus).toBe(0b111);
        expect(root.visible).toBe(true);

        // Set visible to false
        root.visible = false;

        // Local should be updated to 0b101 (renderable + notCulled - visible)
        expect(root.localDisplayStatus).toBe(0b101);
        expect(root.globalDisplayStatus).toBe(0b111);
        expect(root.visible).toBe(false);
    });

    it('should show render group isRenderable works correctly', () =>
    {
        const root = new Container({ isRenderGroup: true });

        // Initially should be renderable
        expect(root.renderGroup.isRenderable).toBe(true);
        expect(root.localDisplayStatus).toBe(0b111);

        // Set visible to false
        root.visible = false;

        // After setting visible = false, localDisplayStatus should change
        expect(root.localDisplayStatus).toBe(0b101);

        // The isRenderable should correctly return false
        expect(root.renderGroup.isRenderable).toBe(false);
    });

    it('should demonstrate the actual bug: Application stage visibility', async () =>
    {
        // Create application
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        // Add a simple sprite to the stage to make rendering visible
        const child = new Container();

        app.stage.addChild(child);

        // Initially stage should be visible and renderable
        expect(app.stage.visible).toBe(true);
        expect(app.stage.localDisplayStatus).toBe(0b111);

        // Set stage to invisible - this should prevent rendering
        app.stage.visible = false;
        expect(app.stage.visible).toBe(false);
        expect(app.stage.localDisplayStatus).toBe(0b101); // Should be not visible

        // The bug: even though stage is invisible, calling app.render()
        // should not process the stage, but it does because
        // AbstractRenderer.render() calls enableRenderGroup() regardless of visibility

        // This is where the actual fix needs to happen - in the renderer's render method
        // It should check if the container is visible before processing it

        app.destroy();
    });

    it('should handle multiple render calls with invisible stage', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        const child = new Container();

        app.stage.addChild(child);

        // Mock render runners to verify calls
        const renderSpy = jest.fn();

        app.renderer.runners.render.add(renderSpy);

        // Set invisible
        app.stage.visible = false;

        // Multiple render calls should all be skipped
        app.render();
        app.render();
        app.render();

        expect(renderSpy).not.toHaveBeenCalled();

        app.destroy();
    });

    it('should handle alpha = 0 with visible stage (alpha test)', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        const child = new Container();

        app.stage.addChild(child);

        let enableRenderGroupCallCount = 0;

        // Mock enableRenderGroup on the container
        const originalEnableRenderGroup = app.stage.enableRenderGroup.bind(app.stage);

        app.stage.enableRenderGroup = () =>
        {
            enableRenderGroupCallCount++;

            return originalEnableRenderGroup();
        };

        // Alpha 0 but visible - should call enableRenderGroup (alpha handled by render groups)
        app.stage.alpha = 0;
        app.stage.visible = true;

        app.render();
        // Should call enableRenderGroup because our fix only checks visibility, not alpha
        expect(enableRenderGroupCallCount).toBe(1);

        // Now make invisible - should not call enableRenderGroup
        app.stage.visible = false;
        app.render();
        expect(enableRenderGroupCallCount).toBe(1); // Still 1, didn't call again

        app.destroy();
    });

    it('should verify visibility check prevents rendering', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        const child = new Container();

        app.stage.addChild(child);

        let enableRenderGroupCallCount = 0;

        // Mock enableRenderGroup on the container
        const originalEnableRenderGroup = app.stage.enableRenderGroup.bind(app.stage);

        app.stage.enableRenderGroup = () =>
        {
            enableRenderGroupCallCount++;

            return originalEnableRenderGroup();
        };

        // Test the exact fix: visible = true should call enableRenderGroup
        app.stage.visible = true;
        app.render();
        expect(enableRenderGroupCallCount).toBe(1);

        // visible = false should not call enableRenderGroup
        app.stage.visible = false;
        app.render();
        expect(enableRenderGroupCallCount).toBe(1); // Still 1

        // visible = true again should call enableRenderGroup
        app.stage.visible = true;
        app.render();
        expect(enableRenderGroupCallCount).toBe(2); // Now 2

        app.destroy();
    });

    it('should handle empty stage (no children) when invisible', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        // No children added to stage
        expect(app.stage.children.length).toBe(0);

        let enableRenderGroupCallCount = 0;

        // Mock enableRenderGroup on the container
        const originalEnableRenderGroup = app.stage.enableRenderGroup.bind(app.stage);

        app.stage.enableRenderGroup = () =>
        {
            enableRenderGroupCallCount++;

            return originalEnableRenderGroup();
        };

        app.stage.visible = false;
        app.render();

        expect(enableRenderGroupCallCount).toBe(0);

        app.destroy();
    });

    it('should handle rapid visibility toggling', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        const child = new Container();

        app.stage.addChild(child);

        let enableRenderGroupCallCount = 0;

        // Mock enableRenderGroup on the container
        const originalEnableRenderGroup = app.stage.enableRenderGroup.bind(app.stage);

        app.stage.enableRenderGroup = () =>
        {
            enableRenderGroupCallCount++;

            return originalEnableRenderGroup();
        };

        // Rapid toggling
        app.stage.visible = false;
        app.render();
        expect(enableRenderGroupCallCount).toBe(0);

        app.stage.visible = true;
        app.render();
        expect(enableRenderGroupCallCount).toBe(1);

        app.stage.visible = false;
        app.render();
        expect(enableRenderGroupCallCount).toBe(1); // Still 1, didn't render

        app.stage.visible = true;
        app.render();
        expect(enableRenderGroupCallCount).toBe(2); // Now 2

        app.destroy();
    });

    it('should work with nested render groups when root invisible', async () =>
    {
        const app = new Application();

        await app.init({ width: 100, height: 100, autoStart: false });

        // Create nested render groups
        const renderGroup1 = new Container({ isRenderGroup: true });
        const renderGroup2 = new Container({ isRenderGroup: true });
        const child = new Container();

        renderGroup2.addChild(child);
        renderGroup1.addChild(renderGroup2);
        app.stage.addChild(renderGroup1);

        const renderSpy = jest.fn();

        app.renderer.runners.render.add(renderSpy);

        // Hide the root stage
        app.stage.visible = false;
        app.render();

        // Should not render anything, even with nested render groups
        expect(renderSpy).not.toHaveBeenCalled();

        app.destroy();
    });

    it('should work with different renderer backgrounds', async () =>
    {
        const app = new Application();

        await app.init({
            width: 100,
            height: 100,
            autoStart: false,
            backgroundColor: 0xff0000
        });

        const child = new Container();

        app.stage.addChild(child);

        const renderSpy = jest.fn();

        app.renderer.runners.render.add(renderSpy);

        app.stage.visible = false;
        app.render();

        expect(renderSpy).not.toHaveBeenCalled();

        app.destroy();
    });
});
