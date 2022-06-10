import { Assets, loadTextures, loadWebFont } from '@pixi/assets';
import { INSTALLED } from '@pixi/core';
import { ContextAttributes, ContextIds, IAdapter, settings } from '@pixi/settings';
import 'cross-fetch/polyfill';
import gl from 'gl';
import { NodeCanvasElement } from './NodeCanvasElement';
import { NodeCanvasResource } from './NodeCanvasResource';
import { loadNodeTexture } from './LoadNodeTexture';
import { loadNodeFont } from './LoadNodeFont';

INSTALLED.length = 0;
INSTALLED.push(NodeCanvasResource);

export const NodeAdapter = {
    createCanvas: (width?: number, height?: number) => new NodeCanvasElement(width, height) as unknown as HTMLCanvasElement,
    getContext: (canvas: NodeCanvasElement, contextId: ContextIds, contextAttributes?: ContextAttributes) =>
        canvas.getContext(contextId, contextAttributes),
    getWebGLRenderingContext: () => gl as unknown as typeof WebGLRenderingContext,
    getNavigator: () => ({ userAgent: 'node' })
} as IAdapter;

settings.ADAPTER = NodeAdapter;

export * from './NodeCanvasElement';
export * from './NodeCanvasResource';
export { settings };

Assets.loader.addParser(loadNodeTexture, loadNodeFont);
Assets.loader.removeParser(loadTextures, loadWebFont);
