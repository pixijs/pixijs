import { ExtensionType } from '../../../extensions/Extensions';

import type { Topology } from '../shared/geometry/const';
import type { Geometry } from '../shared/geometry/Geometry';
import type { Shader } from '../shared/shader/Shader';
import type { State } from '../shared/state/State';
import type { System } from '../shared/system/System';
import type { WebGLRenderer } from './WebGLRenderer';

/**
 * The system that handles encoding commands for the WebGL.
 * @memberof rendering
 */
export class GlEncoderSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'encoder',
    } as const;

    public readonly commandFinished = Promise.resolve();
    private readonly _renderer: WebGLRenderer;

    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;
    }

    public setGeometry(geometry: Geometry, shader?: Shader)
    {
        this._renderer.geometry.bind(geometry, shader.glProgram);
    }

    public finishRenderPass()
    {
        // noop
    }

    public draw(options: {
        geometry: Geometry,
        shader: Shader,
        state?: State,
        topology?: Topology,
        size?: number,
        start?: number,
        instanceCount?: number
        skipSync?: boolean,
    })
    {
        const renderer = this._renderer;
        const { geometry, shader, state, skipSync, topology: type, size, start, instanceCount } = options;

        renderer.shader.bind(shader, skipSync);

        renderer.geometry.bind(geometry, renderer.shader._activeProgram);

        if (state)
        {
            renderer.state.set(state);
        }

        renderer.geometry.draw(type, size, start, instanceCount ?? geometry.instanceCount);
    }

    public destroy()
    {
        (this._renderer as null) = null;
    }
}
