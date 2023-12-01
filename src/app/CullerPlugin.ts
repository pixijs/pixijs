import { ExtensionType } from '../extensions/Extensions';
import { Culler } from '../scene/Culler';

import type { ExtensionMetadata } from '../extensions/Extensions';
import type { Renderer } from '../rendering/renderers/types';
import type { Container } from '../scene/container/Container';

/**
 * An Application plugin that will automatically cull your stage using the renderers screen size.
 * @memberof app
 */
export class CullerPlugin
{
    /** @ignore */
    public static extension: ExtensionMetadata = {
        priority: 10,
        type: ExtensionType.Application,
        name: 'culler',
    };

    public static culler: Culler;
    public static renderer: Renderer;
    public static stage: Container;
    public static render: () => void;
    private static _renderRef: () => void;

    public static init(): void
    {
        this.culler = Culler.shared;

        this._renderRef = this.render.bind(this);

        this.render = (): void =>
        {
            this.culler.cull(this.stage, this.renderer.screen);
            this.renderer.render({ container: this.stage });
        };
    }

    public static destroy(): void
    {
        this.culler = null;
        this.render = this._renderRef;
    }
}
