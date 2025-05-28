import { ExtensionType } from '../extensions/Extensions';
import { Culler } from './Culler';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';

/**
 * An {@link Application} plugin that will automatically cull your stage using the renderers screen size.
 * @example
 * import { extensions, CullerPlugin } from 'pixi.js';
 *
 * extensions.add(CullerPlugin);
 * @category app
 * @standard
 * @see {@link Culler}
 */
export class CullerPlugin
{
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

    /** @internal */
    public static init(): void
    {
        this._renderRef = this.render.bind(this);

        this.render = (): void =>
        {
            Culler.shared.cull(this.stage, this.renderer.screen);
            this.renderer.render({ container: this.stage });
        };
    }

    /** @internal */
    public static destroy(): void
    {
        this.render = this._renderRef;
    }
}
