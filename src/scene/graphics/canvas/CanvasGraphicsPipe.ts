import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { Graphics } from '../shared/Graphics';
import type { GraphicsAdaptor } from '../shared/GraphicsPipe';

/** @internal */
export class CanvasGraphicsPipe implements RenderPipe<Graphics>
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.CanvasPipes,
        ],
        name: 'graphics',
    } as const;

    public renderer: Renderer;
    public state: State = State.for2d();
    private _adaptor: GraphicsAdaptor;
    private readonly _managedGraphics: GCManagedHash<Graphics>;

    constructor(renderer: Renderer, adaptor: GraphicsAdaptor)
    {
        this.renderer = renderer;
        this._adaptor = adaptor;
        this.renderer.runners.contextChange.add(this);
        this._managedGraphics = new GCManagedHash({ renderer, type: 'renderable', priority: -1, name: 'graphics' });
    }

    public contextChange(): void
    {
        this._adaptor.contextChange(this.renderer);
    }

    public validateRenderable(_graphics: Graphics): boolean
    {
        return false;
    }

    public addRenderable(graphics: Graphics, instructionSet: InstructionSet)
    {
        this._managedGraphics.add(graphics);
        this.renderer.renderPipes.batch.break(instructionSet);
        instructionSet.add(graphics);
    }

    public updateRenderable(_graphics: Graphics)
    {
        // no-op for canvas
    }

    public execute(graphics: Graphics)
    {
        if (!graphics.isRenderable) return;

        this._adaptor.execute(this, graphics);
    }

    public destroy()
    {
        this._managedGraphics.destroy();
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
    }
}
