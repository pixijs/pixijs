import type { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';

// `HTMLSourceResource`, `HTMLSourceCanvas`, and `ElementImage` are stand-ins for browser types
// from the experimental HTML-in-Canvas proposal; delete them once browsers ship the real ones.

/**
 * @experimental
 * The resource types the HTML texture uploaders can handle: a live DOM {@link Element}
 * (via {@link HTMLSource}) or an immutable {@link ElementImage} snapshot
 * (via {@link ElementImageSource}).
 * @category rendering
 * @advanced
 */
export type HTMLSourceResource = Element | ElementImage;

/**
 * @experimental
 * An {@link HTMLCanvasElement} extended with the experimental HTML-in-Canvas proposal APIs.
 *
 * These members only exist in browsers that have the HTML-in-Canvas feature enabled, so they
 * are optional. {@link HTMLSource} feature-detects `requestPaint`; the HTML-in-Canvas API must
 * be enabled for the texture to upload.
 * @example
 * ```ts
 * import type { HTMLSourceCanvas } from 'pixi.js/html-source';
 *
 * const canvas = app.canvas as HTMLSourceCanvas;
 *
 * // Feature-detect before relying on the experimental API.
 * if (canvas.requestPaint)
 * {
 *     canvas.requestPaint();
 * }
 * ```
 * @see {@link HTMLSource} For the texture source that drives these APIs
 * @see {@link ElementImage} For the snapshot type `captureElementImage()` returns
 * @category rendering
 * @advanced
 */
export interface HTMLSourceCanvas extends HTMLCanvasElement
{
    /** Requests a `paint` event so the canvas re-snapshots its `layoutsubtree` children. */
    requestPaint?: () => void;
    /** Captures the current rendered pixels of `element` into an immutable {@link ElementImage}. */
    captureElementImage?: (element: Element) => ElementImage;
}

/**
 * @experimental
 * A snapshot produced by the experimental HTML-in-Canvas `captureElementImage()` API.
 *
 * A snapshot is a frozen, immutable copy of an element's rendered pixels at the moment it was
 * captured. Unlike a live {@link HTMLSource} element, it never repaints, so it is a good fit
 * for effects that need a stable image (transitions, "shatter" effects, trails). Snapshots are
 * transferable and cheap to keep around; rendering live elements is what most apps reach for.
 *
 * Call {@link ElementImage.close} (or set {@link ElementImageSourceOptions.autoClose}) to
 * release the underlying memory once you are done.
 * @example
 * ```ts
 * import { ElementImageSource, Sprite } from 'pixi.js/html-source';
 * import type { HTMLSourceCanvas } from 'pixi.js/html-source';
 *
 * const canvas = app.canvas as HTMLSourceCanvas;
 *
 * // Freeze the current pixels of an element into an immutable snapshot.
 * const snapshot = canvas.captureElementImage!(element);
 *
 * const source = new ElementImageSource({ resource: snapshot });
 * const sprite = Sprite.from(source);
 * ```
 * @see {@link ElementImageSource} For rendering a snapshot as a texture
 * @see {@link HTMLSourceCanvas} For the canvas API that produces snapshots
 * @see {@link HTMLSource} For rendering a live, repainting element instead
 * @category rendering
 * @advanced
 */
export interface ElementImage
{
    /** The width of the captured snapshot, in pixels. */
    readonly width: number;
    /** The height of the captured snapshot, in pixels. */
    readonly height: number;
    /** Releases the memory backing this snapshot. The snapshot must not be used afterwards. */
    close(): void;
}

/**
 * @experimental
 * The minimal source shape the HTML texture uploaders consume. Both {@link HTMLSource} and
 * {@link ElementImageSource} satisfy it, so a single set of `'html'` uploaders covers the
 * live-element and snapshot cases.
 * @category rendering
 * @internal
 */
export interface HTMLUploadableSource extends TextureSource
{
    /** A live DOM element or an immutable snapshot. */
    readonly resource: HTMLSourceResource;
    /** Whether the source has pixels ready to upload. */
    readonly isReady: boolean;
    /** Present only on live {@link HTMLSource}; snapshots never repaint. */
    requestPaint?(): boolean;
}
