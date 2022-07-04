import { extensions } from '@pixi/core';
import { BasisLoader } from './BasisLoader';

export * from './Basis';
export * from './BasisLoader';
export * from './BasisParser';
export * from './TranscoderWorker';

extensions.add(BasisLoader);
