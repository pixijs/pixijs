// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - we dynamically create the other index files, so these will throw errors if we don't ignore them

import { DOMAdapter } from './environment/adapter';
import { WebWorkerAdapter } from './environment-webworker/WebWorkerAdapter';
import './environment-webworker/webworkerAll';

export * from './app';
export * from './assets';
export * from './color';
export * from './compressed-textures';
export * from './culling';
export * from './environment';
export * from './environment-webworker';
export * from './environment-webworker/webworkerAll';
export * from './extensions';
export * from './filters';
export * from './maths';
export * from './prepare';
export * from './rendering';
export * from './scene';
export * from './spritesheet';
export * from './ticker';
export * from './utils';

DOMAdapter.set(WebWorkerAdapter);
