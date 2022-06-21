import { Application } from '@pixi/app';
import { INSTALLED } from '@pixi/core';
import { ContextAttributes, ContextIds, IAdapter, settings } from '@pixi/settings';
import 'cross-fetch/polyfill';
import gl from 'gl';
import { loadNodeFont } from './loadNodeFont';
import { loadNodeTexture } from './loadNodeTexture';
import { NodeCanvasElement } from './NodeCanvasElement';
import { NodeCanvasResource } from './NodeCanvasResource';
import './requestAnimationFrame';
import { loadJSON } from './temp/loadJSON';
import { loadSpritesheet } from './temp/loadSpritesheet';

INSTALLED.length = 0;
INSTALLED.push(NodeCanvasResource);
// Remove resize plugin
// eslint-disable-next-line dot-notation
Application['_plugins'].shift();

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
// TODO: replace with new asset loader
export { loadNodeTexture, loadNodeFont, loadJSON, loadSpritesheet };

