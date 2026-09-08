import { ExtensionType } from '../extensions/Extensions';
import { TextureSource } from '../rendering/renderers/shared/texture/sources/TextureSource';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { TextureSourceOptions } from '../rendering/renderers/shared/texture/sources/TextureSource';
import type { ElementImage } from './HTMLSourceTypes';

function isElementImage(resource: unknown): resource is ElementImage
{
    // `ElementImage` is an experimental browser global; rely on `instanceof` against the real
    // constructor when present. Duck-typing on `{ width, height, close }` would also accept
    // `ImageBitmap`, which has its own dedicated uploader path.
    const ElementImageCtor = (globalThis as { ElementImage?: new (...args: unknown[]) => ElementImage }).ElementImage;

    return !!ElementImageCtor && resource instanceof ElementImageCtor;
}

/**
 * @experimental
 * Options for creating an {@link ElementImageSource}.
 * @example
 * ```ts
 * import { ElementImageSource } from 'pixi.js/html-source';
 *
 * // Manual lifetime (default): you call snapshot.close() yourself.
 * const source = new ElementImageSource({ resource: snapshot });
 *
 * // Let the source close the snapshot for you when it is destroyed.
 * const owned = new ElementImageSource({ resource: snapshot, autoClose: true });
 * ```
 * @see {@link ElementImageSource} For the texture source these options configure
 * @extends TextureSourceOptions
 * @category rendering
 * @advanced
 * @noInheritDoc
 */
export interface ElementImageSourceOptions extends TextureSourceOptions<ElementImage>
{
    /**
     * Call {@link ElementImage.close} on the snapshot when this source is destroyed. Leave
     * `false` when the same snapshot is shared with other sources or reused later, otherwise
     * you risk a use-after-free.
     * @default false
     * @example
     * ```ts
     * const source = new ElementImageSource({ resource: snapshot, autoClose: true });
     *
     * source.destroy(); // snapshot.close() is called for you
     * ```
     */
    autoClose?: boolean;
}

/**
 * @experimental
 * A texture source backed by an immutable {@link ElementImage} snapshot produced by the
 * experimental `captureElementImage()` API.
 *
 * This is the static counterpart to {@link HTMLSource}: there is no owning canvas, no `paint`
 * listener, and no repaint lifecycle. The snapshot's pixels never change, so the source is
 * ready the moment it is constructed. Most apps render live elements with {@link HTMLSource};
 * reach for `ElementImageSource` when you need a frozen copy that outlives its element or is
 * transferred around.
 *
 * > [!NOTE]
 * > This relies on an experimental browser proposal. An `ElementImage` passed to `Texture.from`
 * > resolves to an `ElementImageSource` only as a last resort (lowest texture-source priority);
 * > construct it explicitly when you need {@link ElementImageSourceOptions}.
 * @example
 * ```ts
 * import { Sprite } from 'pixi.js';
 * import { ElementImageSource } from 'pixi.js/html-source';
 * import type { HTMLSourceCanvas } from 'pixi.js/html-source';
 *
 * const canvas = app.canvas as HTMLSourceCanvas;
 * const snapshot = canvas.captureElementImage!(element);
 *
 * const source = new ElementImageSource({ resource: snapshot, autoClose: true });
 * const sprite = Sprite.from(source);
 *
 * app.stage.addChild(sprite);
 * ```
 * @example
 * ```ts
 * // Slice a frozen snapshot into sub-textures (e.g. a "shatter" effect that keeps
 * // shattering even after the original element is gone).
 * import { Rectangle, Texture } from 'pixi.js';
 *
 * const source = new ElementImageSource({ resource: snapshot });
 * const chunk = new Texture({
 *     source,
 *     frame: new Rectangle(0, 0, 64, 64),
 * });
 * ```
 * @see {@link ElementImageSourceOptions} For configuration options
 * @see {@link ElementImage} For the snapshot resource
 * @see {@link HTMLSource} For rendering a live, repainting element
 * @see {@link Sprite} For displaying the source on screen
 * @category rendering
 * @advanced
 */
export class ElementImageSource extends TextureSource<ElementImage>
{
    /**
     * Registers the source with the {@link extensions} system at the lowest texture-source
     * priority, so automatic detection only falls back to it when no other built-in source
     * claims the resource.
     */
    public static extension: ExtensionMetadata = {
        type: ExtensionType.TextureSource,
        priority: -10,
    };

    /**
     * Tests whether a resource is an {@link ElementImage} snapshot, used during automatic
     * source detection (`Texture.from`, `TextureSource.from`).
     * @param resource - The resource to test.
     * @returns `true` if this source can handle the resource.
     */
    public static test(resource: any): resource is ElementImage
    {
        return isElementImage(resource);
    }

    /** The upload method for this texture. */
    public uploadMethodId = 'html';

    /** Snapshots are immutable, so the source is ready as soon as it is constructed. */
    public readonly isReady = true;

    private readonly _autoClose: boolean;

    /**
     * @param options - Options for creating the snapshot source. `resource` is required.
     * @example
     * ```ts
     * const source = new ElementImageSource({
     *     resource: snapshot, // an ElementImage from captureElementImage()
     *     autoClose: true,    // close the snapshot when this source is destroyed
     * });
     * ```
     */
    constructor(options: ElementImageSourceOptions)
    {
        if (!options.resource)
        {
            throw new Error('[ElementImageSource] resource is required.');
        }

        super(options);

        this._autoClose = options.autoClose === true;
    }

    /**
     * The width of the snapshot in pixels, rounded up.
     * @example
     * ```ts
     * const source = new ElementImageSource({ resource: snapshot });
     *
     * console.log(source.resourceWidth, source.resourceHeight);
     * ```
     */
    public get resourceWidth(): number
    {
        return Math.ceil(this.resource.width);
    }

    /**
     * The height of the snapshot in pixels, rounded up.
     * @example
     * ```ts
     * const source = new ElementImageSource({ resource: snapshot });
     *
     * console.log(source.resourceWidth, source.resourceHeight);
     * ```
     */
    public get resourceHeight(): number
    {
        return Math.ceil(this.resource.height);
    }

    /**
     * Destroys the underlying texture source. When {@link ElementImageSourceOptions.autoClose}
     * was set, also calls {@link ElementImage.close} on the snapshot.
     * @example
     * ```ts
     * const source = new ElementImageSource({ resource: snapshot });
     *
     * source.destroy();
     * snapshot.close(); // release the snapshot yourself unless autoClose was set
     * ```
     */
    public destroy(): void
    {
        const snapshot = this.resource;

        super.destroy();

        if (this._autoClose && snapshot)
        {
            snapshot.close();
        }
    }
}
