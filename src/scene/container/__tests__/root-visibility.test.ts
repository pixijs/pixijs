import { Container } from '../Container';
import { updateRenderGroupTransforms } from '../utils/updateRenderGroupTransforms';

describe('Root Container Visibility Bug Fix', () =>
{
    it('should not render when root container visibility is false', async () =>
    {
        // Create a root container that acts as a render group (like the Application stage)
        const rootContainer = new Container({ isRenderGroup: true });

        // Create a child element
        const child = new Container();

        rootContainer.addChild(child);

        // Initially, the render group should be renderable
        expect(rootContainer.renderGroup.isRenderable).toBe(true);

        // Set the root container to not visible
        rootContainer.visible = false;

        // Update the render group transforms to propagate the visibility change
        updateRenderGroupTransforms(rootContainer.renderGroup, true);

        // The render group should now NOT be renderable
        expect(rootContainer.renderGroup.isRenderable).toBe(false);

        // Set visible back to true
        rootContainer.visible = true;

        // Update the render group transforms again
        updateRenderGroupTransforms(rootContainer.renderGroup, true);

        // The render group should be renderable again
        expect(rootContainer.renderGroup.isRenderable).toBe(true);
    });

    it('should handle alpha = 0 properly for root containers', async () =>
    {
        const rootContainer = new Container({ isRenderGroup: true });

        // Initially renderable
        expect(rootContainer.renderGroup.isRenderable).toBe(true);

        // Set alpha to 0
        rootContainer.alpha = 0;

        // Update transforms
        updateRenderGroupTransforms(rootContainer.renderGroup, true);

        // Should not be renderable due to worldAlpha being 0
        expect(rootContainer.renderGroup.isRenderable).toBe(false);

        // Reset alpha
        rootContainer.alpha = 1;

        // Update transforms
        updateRenderGroupTransforms(rootContainer.renderGroup, true);

        // Should be renderable again
        expect(rootContainer.renderGroup.isRenderable).toBe(true);
    });

    it('should handle visibility inheritance correctly', async () =>
    {
        const parent = new Container({ isRenderGroup: true });
        const child = new Container();
        const grandchild = new Container();

        child.addChild(grandchild);
        parent.addChild(child);

        // All visible initially
        expect(parent.visible).toBe(true);
        expect(child.visible).toBe(true);
        expect(grandchild.visible).toBe(true);

        // Hide parent (root)
        parent.visible = false;
        updateRenderGroupTransforms(parent.renderGroup, true);

        expect(parent.renderGroup.isRenderable).toBe(false);

        // Hide child but show parent
        parent.visible = true;
        child.visible = false;
        updateRenderGroupTransforms(parent.renderGroup, true);

        // Parent should be renderable (child visibility doesn't affect render group)
        expect(parent.renderGroup.isRenderable).toBe(true);
    });

    it('should handle render group with mixed visible/invisible children', async () =>
    {
        const rootContainer = new Container({ isRenderGroup: true });
        const visibleChild = new Container();
        const invisibleChild = new Container();

        visibleChild.visible = true;
        invisibleChild.visible = false;

        rootContainer.addChild(visibleChild);
        rootContainer.addChild(invisibleChild);

        // Root should be renderable regardless of child visibility
        expect(rootContainer.renderGroup.isRenderable).toBe(true);

        // Hide root - should make entire group non-renderable
        rootContainer.visible = false;
        updateRenderGroupTransforms(rootContainer.renderGroup, true);

        expect(rootContainer.renderGroup.isRenderable).toBe(false);
    });

    it('should handle extreme alpha values with visibility', async () =>
    {
        const rootContainer = new Container({ isRenderGroup: true });

        // Test with very small but non-zero alpha
        rootContainer.alpha = 0.001;
        updateRenderGroupTransforms(rootContainer.renderGroup, true);
        expect(rootContainer.renderGroup.isRenderable).toBe(true);

        // Test with exactly 0
        rootContainer.alpha = 0;
        updateRenderGroupTransforms(rootContainer.renderGroup, true);
        expect(rootContainer.renderGroup.isRenderable).toBe(false);

        // Test with negative alpha (edge case)
        rootContainer.alpha = -0.5;
        updateRenderGroupTransforms(rootContainer.renderGroup, true);
        expect(rootContainer.renderGroup.isRenderable).toBe(false);

        // Test with alpha > 1 (edge case)
        rootContainer.alpha = 1.5;
        updateRenderGroupTransforms(rootContainer.renderGroup, true);
        expect(rootContainer.renderGroup.isRenderable).toBe(true);
    });

    it('should handle render group creation and destruction', async () =>
    {
        const container = new Container();

        // Initially no render group (can be null or undefined)
        expect(container.renderGroup).toBeFalsy();

        // Enable render group
        container.enableRenderGroup();
        expect(container.renderGroup).toBeDefined();
        expect(container.renderGroup.isRenderable).toBe(true);

        // Hide container
        container.visible = false;
        updateRenderGroupTransforms(container.renderGroup, true);
        expect(container.renderGroup.isRenderable).toBe(false);

        // Disable render group
        container.disableRenderGroup();
        expect(container.renderGroup).toBeFalsy();
    });
});
