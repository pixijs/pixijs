import { ExtensionType } from '../extensions/Extensions';
import { PrepareUpload } from './PrepareUpload';

import type { System } from '../rendering/renderers/shared/system/System';

const typeSymbol = Symbol.for('pixijs.PrepareSystem');

/**
 * The prepare system provides renderer-specific plugins for pre-rendering DisplayObjects. This is useful for
 * asynchronously preparing and uploading to the GPU assets, textures, graphics waiting to be displayed.
 *
 * Do not instantiate this plugin directly. It is available from the `renderer.prepare` property.
 * @example
 * import 'pixi.js/prepare';
 * import { Application, Graphics } from 'pixi.js';
 *
 * // Create a new application (prepare will be auto-added to renderer)
 * const app = new Application();
 * await app.init();
 * document.body.appendChild(app.view);
 *
 * // Don't start rendering right away
 * app.stop();
 *
 * // Create a display object
 * const rect = new Graphics()
 *     .beginFill(0x00ff00)
 *     .drawRect(40, 40, 200, 200);
 *
 * // Add to the stage
 * app.stage.addChild(rect);
 *
 * // Don't start rendering until the graphic is uploaded to the GPU
 * app.renderer.prepare.upload(app.stage, () => {
 *     app.start();
 * });
 * @category rendering
 * @advanced
 */
export class PrepareSystem extends PrepareUpload implements System
{
    /**
     * Type symbol used to identify instances of PrepareSystem.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a PrepareSystem.
     * @param obj - The object to check.
     * @returns True if the object is a PrepareSystem, false otherwise.
     */
    public static isPrepareSystem(obj: any): obj is PrepareSystem
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
            ExtensionType.WebGPUSystem,
        ],
        name: 'prepare',
    } as const;

    /** Destroys the plugin, don't use after this. */
    public destroy(): void
    {
        clearTimeout(this.timeout);
        this.renderer = null;
        this.queue = null;
        this.resolves = null;
    }
}
