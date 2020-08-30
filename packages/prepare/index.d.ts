import type { AbstractRenderer } from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import type { Renderer } from '@pixi/core';
import { TextStyle } from '@pixi/text';
import { Texture } from '@pixi/core';

/**
 * The prepare manager provides functionality to upload content to the GPU.
 *
 * BasePrepare handles basic queuing functionality and is extended by
 * {@link PIXI.Prepare} and {@link PIXI.CanvasPrepare}
 * to provide preparation capabilities specific to their respective renderers.
 *
 * @example
 * // Create a sprite
 * const sprite = PIXI.Sprite.from('something.png');
 *
 * // Load object into GPU
 * app.renderer.plugins.prepare.upload(sprite, () => {
 *
 *     //Texture(s) has been uploaded to GPU
 *     app.stage.addChild(sprite);
 *
 * })
 *
 * @abstract
 * @class
 * @memberof PIXI
 */
export declare class BasePrepare
{
    private limiter;
    protected renderer: AbstractRenderer;
    protected uploadHookHelper: any;
    protected queue: Array<any>;
    addHooks: Array<any>;
    uploadHooks: Array<any>;
    completes: Array<any>;
    ticking: boolean;
    private delayedTick;
    /**
     * @param {PIXI.AbstractRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer: AbstractRenderer);
    /**
     * Upload all the textures and graphics to the GPU.
     *
     * @param {Function|PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text} item -
     *        Either the container or display object to search for items to upload, the items to upload themselves,
     *        or the callback function, if items have been added using `prepare.add`.
     * @param {Function} [done] - Optional callback when all queued uploads have completed
     */
    upload(item: IDisplayObjectExtended | IUploadHook | IFindHook | (() => void), done: () => void): void;
    /**
     * Handle tick update
     *
     * @private
     */
    tick(): void;
    /**
     * Actually prepare items. This is handled outside of the tick because it will take a while
     * and we do NOT want to block the current animation frame from rendering.
     *
     * @private
     */
    prepareItems(): void;
    /**
     * Adds hooks for finding items.
     *
     * @param {Function} addHook - Function call that takes two parameters: `item:*, queue:Array`
     *          function must return `true` if it was able to add item to the queue.
     * @return {this} Instance of plugin for chaining.
     */
    registerFindHook(addHook: IFindHook): this;
    /**
     * Adds hooks for uploading items.
     *
     * @param {Function} uploadHook - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
     *          function must return `true` if it was able to handle upload of item.
     * @return {this} Instance of plugin for chaining.
     */
    registerUploadHook(uploadHook: IUploadHook): this;
    /**
     * Manually add an item to the uploading queue.
     *
     * @param {PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text|*} item - Object to
     *        add to the queue
     * @return {this} Instance of plugin for chaining.
     */
    add(item: IDisplayObjectExtended | IUploadHook | IFindHook): this;
    /**
     * Destroys the plugin, don't use after this.
     *
     */
    destroy(): void;
}

/**
 * CountLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of items per frame.
 *
 * @class
 * @memberof PIXI
 */
export declare class CountLimiter
{
    maxItemsPerFrame: number;
    itemsLeft: number;
    /**
     * @param {number} maxItemsPerFrame - The maximum number of items that can be prepared each frame.
     */
    constructor(maxItemsPerFrame: number);
    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    beginFrame(): void;
    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    allowedToUpload(): boolean;
}

export declare interface IDisplayObjectExtended extends DisplayObject {
    _textures?: Array<Texture>;
    _texture?: Texture;
    style?: TextStyle;
}

declare interface IFindHook {
    (item: any, queue: Array<any>): boolean;
}

declare interface IUploadHook {
    (helper: AbstractRenderer | BasePrepare, item: IDisplayObjectExtended): boolean;
}

/**
 * The prepare plugin provides renderer-specific plugins for pre-rendering DisplayObjects. These plugins are useful for
 * asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.plugins` property.
 * See {@link PIXI.CanvasRenderer#plugins} or {@link PIXI.Renderer#plugins}.
 * @example
 * // Create a new application
 * const app = new PIXI.Application();
 * document.body.appendChild(app.view);
 *
 * // Don't start rendering right away
 * app.stop();
 *
 * // create a display object
 * const rect = new PIXI.Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add to the stage
 * app.stage.addChild(rect);
 *
 * // Don't start rendering until the graphic is uploaded to the GPU
 * app.renderer.plugins.prepare.upload(app.stage, () => {
 *     app.start();
 * });
 *
 * @class
 * @extends PIXI.BasePrepare
 * @memberof PIXI
 */
export declare class Prepare extends BasePrepare
{
    /**
     * @param {PIXI.Renderer} renderer - A reference to the current renderer
     */
    constructor(renderer: Renderer);
}

/**
 * TimeLimiter limits the number of items handled by a {@link PIXI.BasePrepare} to a specified
 * number of milliseconds per frame.
 *
 * @class
 * @memberof PIXI
 */
export declare class TimeLimiter
{
    maxMilliseconds: number;
    frameStart: number;
    /**
     * @param {number} maxMilliseconds - The maximum milliseconds that can be spent preparing items each frame.
     */
    constructor(maxMilliseconds: number);
    /**
     * Resets any counting properties to start fresh on a new frame.
     */
    beginFrame(): void;
    /**
     * Checks to see if another item can be uploaded. This should only be called once per item.
     * @return {boolean} If the item is allowed to be uploaded.
     */
    allowedToUpload(): boolean;
}

export { };
