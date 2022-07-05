import type { ContextAttributes, ContextIds, IAdapter } from '@pixi/settings';
import { settings } from '@pixi/settings';
import gl from 'gl';
import { NodeCanvasElement } from './NodeCanvasElement';

export const NodeAdapter = {
    createCanvas: (width?: number, height?: number) => new NodeCanvasElement(width, height) as unknown as HTMLCanvasElement,
    getContext: (canvas: NodeCanvasElement, contextId: ContextIds, contextAttributes?: ContextAttributes) =>
        canvas.getContext(contextId, contextAttributes),
    getWebGLRenderingContext: () => gl as unknown as typeof WebGLRenderingContext,
    getNavigator: () => ({ userAgent: 'node' }),
    getBaseUrl: () => ('/'),
} as IAdapter;

settings.ADAPTER = NodeAdapter;

export { settings };

