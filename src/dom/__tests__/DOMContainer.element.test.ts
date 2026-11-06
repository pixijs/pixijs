import { DOMContainer } from '../DOMContainer';
import { getApp } from '@test-utils';

import type { Application } from '~/app/Application';

describe('DOMContainer element replacement', () =>
{
    let app: Application;
    let container: DOMContainer;
    let host: HTMLDivElement;
    let root: HTMLDivElement;

    beforeEach(async () =>
    {
        app = await getApp({ autoStart: false });
        host = document.createElement('div');
        document.body.appendChild(host);
        host.appendChild(app.canvas);
        container = new DOMContainer({ element: document.createElement('input') });
        app.stage.addChild(container);
        root = app.domContainerRoot;
    });

    afterEach(() =>
    {
        container.destroy();
        app?.destroy();
        host.remove();
    });

    it('should preserve an externally parented element replaced before rendering', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        host.appendChild(first);
        container.element = second;
        app.renderer.render(app.stage);

        expect(first.parentNode).toBe(host);
        expect(second.parentNode).toBe(root);
        expect(root.children).toHaveLength(1);
    });

    it('should detach the rendered element before attaching its replacement', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        expect(first.parentNode).toBe(root);
        container.element = second;

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        app.renderer.render(app.stage);
        expect(second.parentNode).toBe(root);
        expect(root.children).toHaveLength(1);
    });

    it('should clean up repeated replacements, including one never rendered', () =>
    {
        const first = container.element;
        const second = document.createElement('input');
        const third = document.createElement('input');

        app.renderer.render(app.stage);
        container.element = second;
        container.element = third;
        app.renderer.render(app.stage);

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        expect(third.parentNode).toBe(root);
        container.element = first;
        app.renderer.render(app.stage);
        expect(third.parentNode).toBeNull();
        expect(first.parentNode).toBe(root);
        expect(root.children).toHaveLength(1);
    });

    it('should leave the rendered element and its focus intact when assigned again', () =>
    {
        const element = container.element;
        const remove = jest.spyOn(element, 'remove');

        app.renderer.render(app.stage);
        element.focus();
        expect(document.activeElement).toBe(element);
        container.element = element;
        app.renderer.render(app.stage);

        expect(remove).not.toHaveBeenCalled();
        expect(element.parentNode).toBe(root);
        expect(document.activeElement).toBe(element);
    });

    it('should preserve the previous element if it was moved to an external parent', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        host.appendChild(first);
        container.element = second;
        app.renderer.render(app.stage);

        expect(first.parentNode).toBe(host);
        expect(second.parentNode).toBe(root);
    });

    it('should detach a rendered element nested inside the DOM root', () =>
    {
        const first = container.element;
        const second = document.createElement('input');
        const wrapper = document.createElement('div');

        root.appendChild(wrapper);
        wrapper.appendChild(first);
        app.renderer.render(app.stage);
        container.element = second;
        app.renderer.render(app.stage);

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBe(root);
        expect(wrapper.parentNode).toBe(root);
    });

    it.each(['removed', 'hidden'])('should preserve an unrendered replacement when %s', (state) =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        host.appendChild(second);
        container.element = second;
        if (state === 'removed')
        {
            app.stage.removeChild(container);
        }
        else
        {
            container.visible = false;
        }
        app.renderer.render(app.stage);

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBe(host);
        expect(root.children).toHaveLength(0);
    });

    it('should remove all rendered replacements on destroy', () =>
    {
        const first = container.element;
        const second = document.createElement('input');
        const third = document.createElement('input');

        app.renderer.render(app.stage);
        container.element = second;
        app.renderer.render(app.stage);
        container.element = third;
        app.renderer.render(app.stage);
        container.destroy();

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        expect(third.parentNode).toBeNull();
        expect(root.children).toHaveLength(0);
    });

    it('should preserve an unrendered external replacement when the renderer is destroyed', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        host.appendChild(second);
        container.element = second;
        app.destroy();
        app = null;

        expect(second.parentNode).toBe(host);
        expect(first.parentNode).toBeNull();
    });

    it('should not leave a rendered element behind when destroyed before the next render', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        container.element = second;
        container.destroy();

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        expect(root.children).toHaveLength(0);
    });

    it('should detach the replacement on scene removal and mount it again', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        container.element = second;
        app.renderer.render(app.stage);
        app.stage.removeChild(container);
        app.renderer.render(app.stage);

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        app.stage.addChild(container);
        app.renderer.render(app.stage);
        expect(second.parentNode).toBe(root);
        expect(root.children).toHaveLength(1);
    });

    it('should detach the replacement when hidden and mount it again when visible', () =>
    {
        const first = container.element;
        const second = document.createElement('input');

        app.renderer.render(app.stage);
        container.element = second;
        app.renderer.render(app.stage);
        container.visible = false;
        app.renderer.render(app.stage);

        expect(first.parentNode).toBeNull();
        expect(second.parentNode).toBeNull();
        container.visible = true;
        app.renderer.render(app.stage);
        expect(second.parentNode).toBe(root);
        expect(root.children).toHaveLength(1);
    });
});
