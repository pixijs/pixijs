import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Container } from '~/scene';

import type { AccessibilitySystem } from '../AccessibilitySystem';

/**
 * Regression coverage for the O(K^2) -> O(K) rewrite of AccessibilitySystem._updateView.
 * The hot path previously called view.children.indexOf(child) inside a loop over view.children
 * to mark active indices; it now uses the loop index directly. These tests assert the observable
 * behaviour (which divs are created, positioned, recycled and removed) is byte-for-byte the same.
 */

const attachedElements: HTMLElement[] = [];

function attached<T extends HTMLElement>(el: T): T
{
    document.body.appendChild(el);
    attachedElements.push(el);

    return el;
}

afterEach(() =>
{
    attachedElements.forEach((el) => el.remove());
    attachedElements.length = 0;
});

function accessibleChild(x: number, y: number): Container
{
    const container = new Container();

    container.accessible = true;
    container.hitArea = new Rectangle(x, y, 10, 10);

    return container;
}

async function setup(childCount: number)
{
    const renderer = await getWebGLRenderer({ width: 256, height: 256 });

    attached(renderer.canvas as HTMLCanvasElement);

    const system = renderer.accessibility;

    system.setAccessibilityEnabled(true);

    const stage = new Container();
    const children: Container[] = [];

    for (let i = 0; i < childCount; i++)
    {
        // spread the children out so each div lands at a distinct, predictable position
        const child = accessibleChild(i * 12, i * 8);

        stage.addChild(child);
        children.push(child);
    }

    return { renderer, system, stage, children };
}

describe('AccessibilitySystem._updateView scaling', () =>
{
    it('creates a positioned div for every accessible child in one render', async () =>
    {
        const K = 20;
        const { renderer, system, stage, children } = await setup(K);

        renderer.render({ container: stage });

        const overlay = system.div;

        expect(overlay).toBeTruthy();
        // every accessible child got its own div, parented to the main overlay
        expect(system['_tracker'].mainView.children).toHaveLength(K);
        expect(overlay!.childElementCount).toBe(K);

        for (let i = 0; i < K; i++)
        {
            const child = children[i];
            const div = child._accessibleDiv;

            expect(child._accessibleActive).toBe(true);
            expect(div).toBeTruthy();
            expect(div.parentNode).toBe(overlay);

            // hitArea path: position derives from worldTransform; with identity transform at the
            // origin the div lands exactly on the hitArea offset
            const wt = child.worldTransform;
            const hit = child.hitArea as Rectangle;

            expect(div.style.left).toBe(`${wt.tx + (hit.x * wt.a)}px`);
            expect(div.style.top).toBe(`${wt.ty + (hit.y * wt.d)}px`);
            expect(div.style.width).toBe(`${hit.width * wt.a}px`);
            expect(div.style.height).toBe(`${hit.height * wt.d}px`);
        }

        renderer.destroy();
    });

    it('keeps the same div instances across re-renders without re-creating them', async () =>
    {
        const K = 12;
        const { renderer, system, stage, children } = await setup(K);

        renderer.render({ container: stage });

        const firstDivs = children.map((c) => c._accessibleDiv);

        renderer.render({ container: stage });
        renderer.render({ container: stage });

        // no churn: the overlay still holds exactly K divs and every child kept its original div
        expect(system.div!.childElementCount).toBe(K);
        for (let i = 0; i < K; i++)
        {
            expect(children[i]._accessibleDiv).toBe(firstDivs[i]);
            expect(children[i]._accessibleActive).toBe(true);
        }

        renderer.destroy();
    });

    it('recycles only the removed child\'s div into the pool, leaving the rest intact', async () =>
    {
        const K = 10;
        const { renderer, system, stage, children } = await setup(K);

        renderer.render({ container: stage });

        const mainView = system['_tracker'].mainView;

        expect(mainView.children).toHaveLength(K);

        // hide a child in the MIDDLE of the list so we exercise the index-based active marking
        const removedIndex = 4;
        const removed = children[removedIndex];
        const removedDiv = removed._accessibleDiv;

        removed.visible = false;

        renderer.render({ container: stage });

        // the hidden child's div is detached, pooled and cleared
        expect(removed._accessibleActive).toBe(false);
        expect(removed._accessibleDiv).toBeNull();
        expect(removedDiv.parentNode).toBeNull();
        expect(mainView.pools[removed.accessibleType]).toContain(removedDiv);

        // exactly one child left the active set; the rest are untouched and still positioned
        expect(mainView.children).toHaveLength(K - 1);
        expect(mainView.children).not.toContain(removed);

        for (let i = 0; i < K; i++)
        {
            if (i === removedIndex) continue;

            const child = children[i];

            expect(child._accessibleActive).toBe(true);
            expect(child._accessibleDiv).toBeTruthy();
            expect(child._accessibleDiv.parentNode).toBe(system.div);
        }

        renderer.destroy();
    });

    it('reuses a pooled div when a hidden child becomes visible again', async () =>
    {
        const K = 8;
        const { renderer, system, stage, children } = await setup(K);

        renderer.render({ container: stage });

        const target = children[3];
        const originalDiv = target._accessibleDiv;
        const mainView = system['_tracker'].mainView;

        target.visible = false;
        renderer.render({ container: stage });

        expect(mainView.pools[target.accessibleType]).toContain(originalDiv);

        target.visible = true;
        renderer.render({ container: stage });

        // the child is overlaid again, the div is drawn from the pool (same instance), and the
        // overlay is back to the full count with no leaked divs
        expect(target._accessibleActive).toBe(true);
        expect(target._accessibleDiv).toBe(originalDiv);
        expect(originalDiv.parentNode).toBe(system.div);
        expect(mainView.children).toHaveLength(K);
        expect(system.div!.childElementCount).toBe(K);
        expect(mainView.pools[target.accessibleType]).not.toContain(originalDiv);

        renderer.destroy();
    });

    it('removes every overlay div when the whole scene is emptied', async () =>
    {
        const K = 15;
        const { renderer, system, stage, children } = await setup(K);

        renderer.render({ container: stage });

        const divs = children.map((c) => c._accessibleDiv);

        expect(system.div!.childElementCount).toBe(K);

        children.forEach((c) => (c.visible = false));
        renderer.render({ container: stage });

        const mainView = system['_tracker'].mainView;

        // all children left the active set; their divs are detached and pooled for reuse
        expect(mainView.children).toHaveLength(0);
        expect(system.div!.childElementCount).toBe(0);
        for (const child of children)
        {
            expect(child._accessibleActive).toBe(false);
            expect(child._accessibleDiv).toBeNull();
        }
        for (const div of divs)
        {
            expect(div.parentNode).toBeNull();
            expect(mainView.pools.button).toContain(div);
        }

        renderer.destroy();
    });

    it('keeps the active set stable across many frames with a large child count', async () =>
    {
        const K = 64;
        const { renderer, system, stage, children } = await setup(K);

        for (let frame = 0; frame < 5; frame++)
        {
            renderer.render({ container: stage });
        }

        const mainView = (system as AccessibilitySystem)['_tracker'].mainView;

        // after repeated renders nothing has been spuriously removed or duplicated
        expect(mainView.children).toHaveLength(K);
        expect(system.div!.childElementCount).toBe(K);
        for (const child of children)
        {
            expect(child._accessibleActive).toBe(true);
            expect(mainView.children).toContain(child);
        }

        renderer.destroy();
    });
});
