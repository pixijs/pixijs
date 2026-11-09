import { getWebGLRenderer } from '@test-utils';
import { Container } from '~/scene';

function createCanvas(width = 100, height = 100)
{
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    document.body.appendChild(canvas);

    return canvas;
}

describe('ViewSystem.removeView main view', () =>
{
    it('refuses to remove the main view and keeps it rendering and resolvable', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });

        const views = renderer.view['_views'];
        const mainView = views[0];

        expect(mainView.isMain).toBe(true);

        const lengthBefore = views.length;

        renderer.removeView(mainView);

        // main view survives: still registered at index 0, count unchanged
        expect(renderer.view['_views'].length).toBe(lengthBefore);
        expect(renderer.view['_views'][0]).toBe(mainView);

        // the main canvas still resolves to the main view (not null) for events/DOM
        expect(renderer.view.viewForTarget(renderer.canvas)).toBe(mainView);

        // the main canvas still renders after the no-op removal attempt
        expect(() => renderer.render({ container: new Container() })).not.toThrow();

        renderer.destroy();
    });

    it('still removes a secondary view (control)', async () =>
    {
        const renderer = await getWebGLRenderer({ multiView: true });
        const canvas = createCanvas();

        const secondaryView = renderer.addView({ canvas });
        const lengthBefore = renderer.view['_views'].length;

        expect(secondaryView.isMain).toBe(false);

        renderer.removeView(secondaryView);

        expect(renderer.view['_views'].length).toBe(lengthBefore - 1);
        expect(renderer.view['_views']).not.toContain(secondaryView);
        expect(renderer.view.viewForTarget(canvas)).toBeNull();

        // main view is untouched and still renders
        expect(renderer.view['_views'][0].isMain).toBe(true);
        expect(() => renderer.render({ container: new Container() })).not.toThrow();

        renderer.destroy();
        canvas.remove();
    });
});
