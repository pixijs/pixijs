import { HTMLSource } from '../HTMLSource';

describe('HTMLSource', () =>
{
    let canvas: HTMLCanvasElement;

    beforeEach(() =>
    {
        canvas = document.body.appendChild(document.createElement('canvas'));
    });

    afterEach(() =>
    {
        canvas.remove();
    });

    it('should mark the canvas and element drawable', () =>
    {
        const element = canvas.appendChild(document.createElement('div'));
        const source = new HTMLSource({ resource: element });

        expect(canvas.getAttribute('content')).toBe('drawable');
        expect(canvas.hasAttribute('layoutsubtree')).toBe(true);
        expect(element.hasAttribute('drawable')).toBe(true);

        source.destroy();
    });

    it('should infer the owning canvas of a nested element', () =>
    {
        const panel = canvas.appendChild(document.createElement('div'));
        const button = panel.appendChild(document.createElement('button'));
        const source = new HTMLSource({ resource: button });

        expect(source.canvas).toBe(canvas);

        source.destroy();
    });

    it('should throw when the element is outside the given canvas', () =>
    {
        const element = document.body.appendChild(document.createElement('div'));

        expect(() => new HTMLSource({ resource: element, canvas }))
            .toThrow('[HTMLSource] resource must be inside the owning canvas.');

        element.remove();
    });

    it('should update a nested element when its drawable ancestor is reported as changed', () =>
    {
        const panel = canvas.appendChild(document.createElement('div'));
        const sibling = canvas.appendChild(document.createElement('div'));
        const button = panel.appendChild(document.createElement('button'));
        const source = new HTMLSource({ resource: button });
        const onUpdate = jest.fn();

        source.on('update', onUpdate);

        canvas.dispatchEvent(Object.assign(new Event('paint'), { changedElements: [sibling] }));
        expect(onUpdate).not.toHaveBeenCalled();

        canvas.dispatchEvent(Object.assign(new Event('paint'), { changedElements: [panel] }));
        expect(onUpdate).toHaveBeenCalledTimes(1);

        source.destroy();
    });
});
