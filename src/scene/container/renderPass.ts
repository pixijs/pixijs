import type { Matrix } from '../../maths/matrix/Matrix';
import type { Container } from './Container';
import type { RenderGroup } from './RenderGroup';

/**
 * The main view of a renderer.
 * @internal
 */
export interface RenderView
{
    /** Changes whenever what the view shows is taken off it: by a render that clears it, or by destroying the renderer. */
    frame: number;
}

/**
 * The render that is running. Shared by every renderer, as only one can be running at a time,
 * although it can start another before it finishes.
 * @internal
 */
export const renderPass = {
    /** Unique to this render, 0 when nothing is rendering. */
    id: 0,
    /** The render group being rendered. */
    root: null as RenderGroup | null,
    /** The transform the root is drawn with, in place of its own and its parents'. */
    transform: null as Matrix | null,
    /** The view it draws to, null if it draws to anything else. */
    view: null as RenderView | null,
};

let count = 0;

/**
 * Whether a container is being rendered without its parents.
 * @param container
 * @internal
 */
export function isPassRoot(container: Container): boolean
{
    return renderPass.root !== null && container.renderGroup === renderPass.root;
}

/**
 * The transform a container is drawn with, in place of its own and its parents', if it is being rendered.
 * @param container
 * @internal
 */
export function getPassRootTransform(container: Container): Matrix | null
{
    if (!isPassRoot(container)) return null;

    const { transform } = renderPass;

    if (transform === container.localTransform) container.updateLocalTransform();

    return transform;
}

/**
 * Runs a render, and goes back to the one that started it, if any, however it ends.
 * @param root
 * @param transform
 * @param view
 * @param render
 * @internal
 */
export function runRenderPass(root: RenderGroup, transform: Matrix, view: RenderView | null, render: () => void): void
{
    const { id, root: outerRoot, transform: outerTransform, view: outerView } = renderPass;

    renderPass.id = ++count;
    renderPass.root = root;
    renderPass.transform = transform;
    renderPass.view = view;

    try
    {
        render();
    }
    finally
    {
        renderPass.id = id;
        renderPass.root = outerRoot;
        renderPass.transform = outerTransform;
        renderPass.view = outerView;
    }
}
