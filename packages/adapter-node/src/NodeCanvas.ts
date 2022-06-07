import type { NodeCanvasRenderingContext2DSettings } from 'canvas';
import { Canvas } from 'canvas';
import gl from 'gl';

export class NodeCanvas extends Canvas
{
    private glContext?: WebGLRenderingContext;
    private context2d?: CanvasRenderingContext2D;
    public readonly style = {};

    constructor(width = 16, height = 16)
    {
        super(width, height);
    }

    public updateSize(width: number, height: number)
    {
        if (this.width === width && this.height === height) return;

        this.width = width;
        this.height = height;

        if (this.glContext)
        {
            // Make sure dimension changes are propagated to WebGL context
            const ext = this.glContext.getExtension('STACKGL_resize_drawingbuffer');

            ext.resize(this.width, this.height);
        }
    }

    public getNodeContext(
        contextId: string,
        contextAttributes?:
        | NodeCanvasRenderingContext2DSettings
        | WebGLContextAttributes
    ): CanvasRenderingContext2D | WebGLRenderingContext | undefined
    {
        switch (contextId)
        {
            case '2d': {
                if (!this.context2d)
                {
                    this.context2d = super.getContext('2d', contextAttributes);
                }

                return this.context2d;
            }
            case 'webgl': {
                if (!this.glContext)
                {
                    this.glContext = gl(this.width, this.height, contextAttributes);
                }

                return this.glContext;
            }
            default: {
                return undefined;
            }
        }
    }

    public addEventListener(): void
    {
        // Nothing to do
    }

    public RemoveEventListener(): void
    {
        // Nothing to do
    }
}
