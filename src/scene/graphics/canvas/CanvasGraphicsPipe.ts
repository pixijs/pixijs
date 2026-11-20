import { ExtensionType } from '../../../extensions/Extensions';
import { State } from '../../../rendering/renderers/shared/state/State';
import { GCManagedHash } from '../../../utils/data/GCManagedHash';
import { GraphicsGpuData } from '../shared/AbstractGraphicsPipe';

import type { InstructionSet } from '../../../rendering/renderers/shared/instructions/InstructionSet';
import type { RenderPipe } from '../../../rendering/renderers/shared/instructions/RenderPipe';
import type { Renderer } from '../../../rendering/renderers/types';
import type { GraphicsAdaptor } from '../shared/AbstractGraphicsPipe';
import type { Graphics } from '../shared/Graphics';

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
        this._getGpuDataForRenderable(graphics);
        this.renderer.renderPipes.batch.break(instructionSet);
        instructionSet.add(graphics);
    }

    public updateRenderable(graphics: Graphics)
    {
        // track the graphics again if it was unloaded without a rebuild, e.g. by its context
        this._getGpuDataForRenderable(graphics);
    }

    public execute(graphics: Graphics)
    {
        if (!graphics.isRenderable) return;

        this._adaptor.execute(this, graphics);
    }

    private _getGpuDataForRenderable(graphics: Graphics): GraphicsGpuData
    {
        return graphics._gpuData[this.renderer.uid] || this._initGpuDataForRenderable(graphics);
    }

    private _initGpuDataForRenderable(graphics: Graphics): GraphicsGpuData
    {
        // the canvas pipe has no batches to keep, but the managed hash only releases a graphics
        // that has GPU data for this renderer, so store an empty record before tracking it
        const gpuData = new GraphicsGpuData();

        graphics._gpuData[this.renderer.uid] = gpuData;

        this._managedGraphics.add(graphics);

        return gpuData;
    }

    public destroy()
    {
        this._managedGraphics.destroy();
        this.renderer = null;

        this._adaptor.destroy();
        this._adaptor = null;
    }
}
