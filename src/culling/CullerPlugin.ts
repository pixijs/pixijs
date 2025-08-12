import { ExtensionType } from '../extensions/Extensions';
import { Culler } from './Culler';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';

const typeSymbol = Symbol.for('pixijs.CullerPlugin');

/**
 * Application options for the {@link CullerPlugin}.
 * These options control how your application handles culling of display objects.
 * @example
 * ```ts
 * import { Application } from 'pixi.js';
 *
 * // Create application
 * const app = new Application();
 * await app.init({
 *     culler: {
 *         updateTransform: false // Skip updating transforms for culled objects
 *     }
 * });
 * ```
 * @category app
 * @standard
 */
export interface CullerPluginOptions
{
    /**
     * Options for the culler behavior.
     * @example
     * ```ts
     * // Basic culling options
     * const app = new Application();
     * await app.init({
     *     culler: {...}
     * });
     * ```
     */
    culler?: {
        /**
         * Update the transform of culled objects.
         *
         * > [!IMPORTANT] Keeping this as `false` can improve performance by avoiding unnecessary calculations,
         * > however, the transform used for culling may not be up-to-date if the object has moved since the last render.
         * @default true
         * @example
         * ```ts
         * const app = new Application();
         * await app.init({
         *     culler: {
         *         updateTransform: false // Skip updating transforms for culled objects
         *     }
         * });
         * ```
         */
        updateTransform?: boolean;
    };
}

/**
 * An {@link Application} plugin that automatically culls (hides) display objects that are outside
 * the visible screen area. This improves performance by not rendering objects that aren't visible.
 *
 * Key Features:
 * - Automatic culling based on screen boundaries
 * - Configurable culling areas and behavior per container
 * - Can improve rendering performance
 * @example
 * ```ts
 * import { Application, CullerPlugin, Container, Rectangle } from 'pixi.js';
 *
 * // Register the plugin
 * extensions.add(CullerPlugin);
 *
 * // Create application
 * const app = new Application();
 * await app.init({...});
 *
 * // Create a container with culling enabled
 * const container = new Container();
 * container.cullable = true;         // Enable culling for this container
 * container.cullableChildren = true; // Enable culling for children (default)
 * app.stage.addChild(container);
 *
 * // Optional: Set custom cull area to avoid expensive bounds calculations
 * container.cullArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
 *
 * // Add many sprites to the group
 * for (let j = 0; j < 100; j++) {
 *     const sprite = Sprite.from('texture.png');
 *     sprite.x = Math.random() * 2000;
 *     sprite.y = Math.random() * 2000;
 *
 *     sprite.cullable = true; // Enable culling for each sprite
 *
 *     // Set cullArea if needed
 *     // sprite.cullArea = new Rectangle(0, 0, 100, 100); // Optional
 *
 *     // Add to container
 *     container.addChild(sprite);
 * }
 * ```
 * @remarks
 * To enable culling, you must set the following properties on your containers:
 * - `cullable`: Set to `true` to enable culling for the container
 * - `cullableChildren`: Set to `true` to enable culling for children (default)
 * - `cullArea`: Optional custom Rectangle for culling bounds
 *
 * Performance Tips:
 * - Group objects that are spatially related
 * - Use `cullArea` for containers with many children to avoid bounds calculations
 * - Set `cullableChildren = false` for containers that are always fully visible
 * @category app
 * @standard
 * @see {@link Culler} For the underlying culling implementation
 * @see {@link CullingMixinConstructor} For culling properties documentation
 */
export class CullerPlugin
{
    /**
     * Type symbol used to identify instances of CullerPlugin.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a CullerPlugin.
     * @param obj - The object to check.
     * @returns True if the object is a CullerPlugin, false otherwise.
     */
    public static isCullerPlugin(obj: any): obj is CullerPlugin
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension: ExtensionMetadata = {
        priority: 10,
        type: ExtensionType.Application,
        name: 'culler',
    };

    /** @internal */
    public static renderer: Renderer;
    /** @internal */
    public static stage: Container;
    /** @internal */
    public static render: () => void;
    private static _renderRef: () => void;

    /**
     * Initialize the plugin with scope of application instance
     * @private
     * @param {object} [options] - See application options
     */
    public static init(options?: PixiMixins.ApplicationOptions): void
    {
        this._renderRef = this.render.bind(this);

        this.render = (): void =>
        {
            // default to true for updateTransform, unless specified otherwise
            const updateTransform = options?.culler?.updateTransform !== true;

            Culler.shared.cull(this.stage, this.renderer.screen, updateTransform);
            this.renderer.render({ container: this.stage });
        };
    }

    /** @internal */
    public static destroy(): void
    {
        this.render = this._renderRef;
    }
}
